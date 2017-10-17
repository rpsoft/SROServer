var exist = require('easy-exist');
var Base64 = require('js-base64').Base64;
var Deque = require("double-ended-queue");


import {EDB_LOGIN} from "./config"

var bufferSize = 50
var queryBuffer = new Deque(bufferSize)


// connect
var db = new exist.DB('http://localhost:8080', {
    username: EDB_LOGIN.username,
    password: EDB_LOGIN.password,
});


function translateOrderingField(sortField){
  var xmlField = ""
  switch (sortField){
        case 'id':
         xmlField = '@xml:id'
         break;
        case 'date':
         xmlField = 'date//text()[last()]'
         break;
        default:
         xmlField = '@xml:id'
      }
      return xmlField;
}

function mergeFilter(filterArray){
    var filterString = ""
    if ( filterArray.length > 0 ) {

      filterString = filterArray.join(" or ")

    }
    return filterString;
}

export async function advSearch(q){
    console.log(JSON.stringify(q))
    var queryCode = JSON.stringify(q);

    for (var i = 0; i < bufferSize; i++ ){
      if ( queryBuffer.get(i) && queryBuffer.get(i).queryCode == queryCode ){
          console.log("Reusing buffered search: "+queryBuffer.length)
          return queryBuffer.get(i).data;
      }
    }

    var filters = eval(q.filters)

    console.log(filters)
    //{"query":"william","person":"gfdgfd","copies":"fsdfds","minDate":"-14999130000000","maxDate":"1000335600000","minFees":"32","maxFees":"32","entry":"fdsafdsarew","page":"1","limit":"20","sortField":"@xml:id","direction":"ascending"}

    var dateFiltersArray = [];

    var volumeFiltersArray = [];

    var entryTypeFiltersArray = [];

    var entererRoleFiltersArray = [];

    for ( var f in filters ){

      var filterKey = filters[f].split("_")[0]
      var filterValue  = filters[f].split("_")[1]

      switch ( filterKey ){
        case "date":
            var minDate = filterValue.split("-")[0]+"-01-01"
            var maxDate = filterValue.split("-")[1]+"-12-31"

            dateFiltersArray.push ("(.//ab[@type='metadata']/date[@type='SortDate']/@when >= xs:date('"+minDate+"') and .//ab[@type='metadata']/date[@type='SortDate']/@when <= xs:date('"+maxDate+"'))")
            // dateFiltersArray.push ("(.//ab[@type='metadata']/date/@notBefore >= xs:date('"+minDate+"') and .//ab[@type='metadata']/date/@notBefore <= xs:date('"+maxDate+"'))")

            //dateFiltersArray.push ("( ( (.//ab[@type='metadata']/date/@when >= xs:date('"+minDate+"')) or (.//ab[@type='metadata']/date/@notBefore >= xs:date('"+minDate+"')) ) and ((.//ab[@type='metadata']/date/@when <= xs:date('"+maxDate+"') ) or (.//ab[@type='metadata']/date/@notBefore <= xs:date('"+maxDate+"')) ) )")

            break;
        case "volume":
            volumeFiltersArray.push('.//idno[@type="Liber"] = "'+filterValue+'"')
            break

        case "entryType":

            entryTypeFiltersArray.push('(count(.//note[@subtype="'+(filterValue.toLowerCase() == "notprinted" ? "notPrinted" : filterValue.toLowerCase())+'"]) > 0)')

            break

        case "entererRole":
            switch(filterValue) {
              case "Stationer":
                entererRoleFiltersArray.push("contains(data(.//persName[contains(@role, 'enterer')]/@role),'stationer')")
                break;
              case "Non-Stationer":
                entererRoleFiltersArray.push("not(contains(data(.//persName[contains(@role, 'enterer')]/@role),'stationer'))")
                break;
            }

            break;
      }
    }

    var dateFiltersString = mergeFilter(dateFiltersArray)
    var volumeFilterString = mergeFilter(volumeFiltersArray)
    var entryTypeFilterString = mergeFilter(entryTypeFiltersArray)
    var entererRoleFilterString = mergeFilter(entererRoleFiltersArray)

    // var statusTypes = [ "annotated", "cancelled", "entered", "incomplete", "notPrinted", "other", "reassigned", "shared", "stock", "unknown" ]
    // var statusGatheringString = statusTypes.map( (v,i) => { return  'let $'+v.toLowerCase()+ 'notes := count($hit//note[@subtype="'+v+'"])' }  ).join(" ")

    // console.log(statusGatheringString)
    console.log(entryTypeFilterString)

    var advSearch_dates = ""

    if(q.minDate && q.maxDate){
      advSearch_dates = "and ( ($currentDate >= xs:date('"+q.minDate+"') and $currentDate <= xs:date('"+q.maxDate+"')) )";
    } else if( q.minDate ){
      advSearch_dates = "and ( ($currentDate >= xs:date('"+q.minDate+"') ) )";
    } else if( q.maxDate ){
      advSearch_dates = "and ( ($currentDate <= xs:date('"+q.maxDate+"') ) )";
    }

    console.log("minDate: "+q.minDate)
    console.log("maxDate: "+q.maxDate)

    console.log("hello:"+advSearch_dates);

    var macroFilterArray = [];

    dateFiltersString.length > 0 ? macroFilterArray.push ( "["+dateFiltersString+"]" ) : ""
    volumeFilterString.length > 0 ? macroFilterArray.push ( "["+volumeFilterString+"]" ) : ""
    entererRoleFilterString.length > 0 ? macroFilterArray.push ( "["+entererRoleFilterString+"]" ) : ""
    entryTypeFilterString.length > 0 ? macroFilterArray.push ( "["+entryTypeFilterString+"]" ) : ""

    var feesArray = []
    q.minFees ? feesArray.push(' (data(.//num[@type="totalPence"]/@value) >= '+q.minFees+' )') : ''
    q.maxFees ? feesArray.push(' (data(.//num[@type="totalPence"]/@value) <= '+q.maxFees+' )') : ''
    feesArray.length > 0 ? macroFilterArray.push(" [ "+feesArray.join ( " and " )+" ] ") : ""

    q.person ? macroFilterArray.push('[contains(lower-case(string-join(.//persName//text(),"")), "'+q.person.toLowerCase()+'") ]') : ""

    var sroid = q.entry ? (q.entry.indexOf("SRO") == 0 ? q.entry : "SRO"+q.entry) : ""

    q.entry ? macroFilterArray.push('[.//@xml:id = "'+sroid+'"]') : ""

    var macroFilter = macroFilterArray.join("")

    console.log("MAC: "+macroFilter)

    var query  = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; declare function local:filter($node as node(), $mode as xs:string) as xs:string? { if ($mode eq "before") then concat($node, " ") else concat(" ", $node) }; import module namespace kwic="http://exist-db.org/xquery/kwic";'
    +' let $pageLimit as xs:decimal := '+q.limit+' let $page as xs:decimal := '+q.page+' let $allResults := array { for $hit in collection("/db/SRO")//tei:div'
    + (q.query ? '[ft:query(., "'+q.query+'")]' : '')
    + (macroFilter ? macroFilter : "")
    +' let $currentDate as xs:date := xs:date(data($hit//ab[@type="metadata"]/date[@type="SortDate"]/@when))  '
    +' where $hit/@type="entry" '
    + advSearch_dates

    var post_query = ' let $expanded := kwic:expand($hit) let $sum := array { for $h in $expanded//exist:match return kwic:get-summary($expanded, $h, <config xmlns="" width="40"/>) } return <entry> <date>{ $currentDate }</date> <docid>{data($hit//@xml:id)}</docid> <doc>{$hit}</doc> <sum>{$sum}</sum> </entry> } let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := if ( $pageLimit - $offset < 1) then 1 else $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries>{array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn))}</entries> </results> '

    if ( q.sortField ){
      if ( q.sortField == "date" ){
        query = query + ' order by $currentDate '+q.direction+' '
      } else {
        query = query + ' order by $hit//'+translateOrderingField(q.orderField).trim()+' '+q.direction+' '
      }
    } else {
      query = query + ' order by $hit//@xml:id ascending '
    }

    var query = query+post_query

    console.log(query)

    return new Promise( function (Resolve,Reject){

        try{
          db.query(query,{wrap:"no"})
              .then(function(result) {
                  if ( queryBuffer.length >= bufferSize){
                    queryBuffer.shift()
                  }
                  queryBuffer.push({queryCode : queryCode, data: result })
                  Resolve(result)
                })

        } catch (error){
           Reject ("Something failed in the ExistDB Module: "+error)
        }

      });

  }

export async function textSearch(query, page, limit, orderField, direction){

    var query  = 'xquery version "3.1"; import module namespace kwic="http://exist-db.org/xquery/kwic"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := '+limit+' let $page as xs:decimal := '+page+' '
          +'let $allResults := array { for $hit in collection("/db/SRO")//tei:div[ft:query(., "'+query+'")]'
          +' let $score as xs:float := ft:score($hit) where $hit/@type="entry"'

    var post_query = ' let $sum := kwic:summarize($hit, <config xmlns="" width="100"/>) return <comp><doc>{$hit}</doc><sum>{$sum}</sum></comp> } '
          +' let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hita in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) let $hit := $hita/doc return <entry> <docid>{data($hit//@xml:id)}</docid> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> {$hit} {$hita/sum} </entry> } </entries> </results> '


    if ( orderField ){
      if( orderField.indexOf("date") > -1 ){
        query = query + ' order by $currentDate '+direction+' '
      } else {
        query = query + ' order by $hit//'+orderField.trim()+' '+direction+' '
      }
    } else {
      query = query + ' order by $score descending '
    }

    var query = query+post_query

    console.log(query)

    return new Promise( function (Resolve,Reject){

        try{
          db.query(query,{wrap:"no"})
              .then(function(result) {
                  //console.log('xQuery result:', result);
                  Resolve(result)
                })

        } catch (error){
           Reject ("Something failed in the ExistDB Module: "+error)
        }

      });

  }

  export async function getAllEntriesOrdered(){


      var query = 'xquery version "3.0";'+
                  'declare default element namespace "http://www.tei-c.org/ns/1.0";'+
                  'declare namespace tei="http://www.tei-c.org/ns/1.0";'+
                  '<entries>'+
                  '{'+
                  ' for $hit in collection("/db/SRO")//tei:div[@type="entry"]'+
                  'let $score as xs:float := ft:score($hit) where $hit/@type="entry" order by $score descending return <entry> <docid>{data($hit/@xml:id)}</docid> <score>{data($score)}</score> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <stationers>{ for $stat in $hit//persName where $stat/@role="stationer" return <name> {string-join( ($stat/forename,$stat/surname), ", ")} </name> } </stationers> <doc>{ for $item in $hit/p return <item>{fn:string-join($item//text()," ")}</item> }</doc> </entry> } </entries>'

      return new Promise( function (Resolve,Reject){

          try{
            db.query(query,{wrap:"no"})
                .then(function(result) {
                    //console.log('xQuery result:', result);
                    Resolve(result)
                  })

          } catch (error){
             Reject ("Something failed in the ExistDB Module: "+error)
          }

        });

    }


    export async function getAllPeople(){

        return new Promise( function (Resolve,Reject){
            try{
              db.executeStoredQuery("/QS/allPeople.xq")
                  .then(function(result) {
                      //console.log('xQuery result:', result);
                      Resolve(result)
                    })

            } catch (error){
               Reject ("Something failed in the ExistDB Module: "+error)
            }
          });
      }

    export async function getAllEntries(){

        return new Promise( function (Resolve,Reject){
            try{
              db.executeStoredQuery("/QS/allEntries.xq")
                  .then(function(result) {
                      Resolve(result)
                    })

            } catch (error){
               Reject ("Something failed in the ExistDB Module: "+error)
            }

          });

      }

      export async function getEntry(entryID){
        var query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; for $coll in collection("/db/SRO") for $hit in $coll//tei:div[@type="entry"] where $hit/@xml:id = "'+entryID+'" return $hit';
        console.log(query);

        return new Promise( function (Resolve,Reject){

            try{
              db.query(query,{wrap:"no"})
                  .then(function(result) {
                      //console.log('xQuery result:', result);
                      Resolve(result)
                    })

            } catch (error){
               Reject ("Something failed in the ExistDB Module: "+error)
            }

          });

        }

      export async function getAllEntriesPaged(page,limit,orderField, direction){
        console.log("USAMOS ESTE: "+orderField+" -- "+direction)

        var queryCode = Base64.encode(page+"-"+limit+"-"+orderField+"-"+direction);

        //console.log("QUERY: "+Base64.encode(JSON.stringify(q)))

        for (var i = 0; i < bufferSize; i++ ){
          if ( queryBuffer.get(i) && queryBuffer.get(i).queryCode == queryCode ){
              return queryBuffer.get(i).data;
          }
        }


        var query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := '+limit+' let $page as xs:decimal := '+page+' let $allResults := array { for $hit in collection("/db/SRO")//tei:div '
        +' let $score as xs:float := ft:score($hit) let $currentDate as xs:date := xs:date( if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore)) let $rawCode as xs:decimal := xs:decimal( replace($hit//@xml:id, "[^0-9]", "") ) '
        +' where $hit/@type="entry" '

        if ( orderField ){
          if( orderField.indexOf("date") > -1 ){
            query = query + ' order by $currentDate '+direction+' '
          } else if( orderField.indexOf("volume") > -1 ){
            query = query + ' order by $rawCode '+direction+' '
          } else {
            query = query + ' order by $hit//'+orderField.trim()+' '+direction+' '
          }
        } else {
          query = query + ' order by $score descending '
        }

        query = query +'return <comp><doc>{$hit}</doc></comp> } let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := if ( $pageLimit - $offset < 1) then 1 else $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hita in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) let $hit := $hita/doc return <entry> <docid>{data($hit//@xml:id)}</docid> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> {$hit} </entry> } </entries> </results>';


        console.log(query);

        return new Promise( function (Resolve,Reject){

            try{
              db.query(query,{wrap:"no"})
                  .then(function(result) {
                      //console.log('xQuery result:', result);
                      queryBuffer.push({queryCode : queryCode, data: result })
                      Resolve(result)
                    }).catch(function (rejected){
                      console.log(rejected)
                    })

            } catch (error){
               Reject ("Something failed in the ExistDB Module: "+error)
            }

          });
        }



// USAGE EXAMPLE OF THE EASY-EXIST MODULE

// PUT a document
// db.put('/my-collection/my-document', body)
//
//     // Get the body of a document
//     .then(function() {
//         return db.get('/my-collection/my-document');
//     })
//     .then(function(doc) {
//         console.log('Document Body:', doc);
//     })
//
//     // Execute xQuery
//     .then(function() {
//         return db.query('collection("my-collection")/message/body');
//     })
//     .then(function(result) {
//         console.log('xQuery result:', result);
//     })
//
//     // Delete document
//     .then(function() {
//         return db.delete('/my-collection/my-document');
//     })
//     .then(function() {
//         console.log('Document Deleted');
//     });
//

//WASUsPS
