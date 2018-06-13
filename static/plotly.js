
// Use `document.getElementById`, `document.createElement` and `append` to populate the create 
//option elements and append them to the dropdown selector.
function PopulateNames(){
    url="/names";
    Plotly.d3.json(url, function(error, response)
     {
         console.log("PopulateNames:Got Response")
        var select = document.getElementById('selDataset')
        for(var i=0;i<response.length;i++)
        {
        var option = document.createElement('option');
        option.value = response[i];
        option.text=response[i];
        select.appendChild(option)
        }
        Initialize();
    });
    console.log("PopulateNames:End")
}
PopulateNames();

function Initialize()
{
    document.getElementById("selDataset").selectedIndex = 0;
    optionChanged(document.getElementById("selDataset").value);
}
// Create a function called `optionChanged` to handle the change event when a new sample 
//is selected (i.e. fetch data for the newly selected sample).
function optionChanged(dropdown_value)
{
    DrawCharts(dropdown_value);
    DisplayMetadata(dropdown_value);
}
//Display the SAMPLE METADATA from the route /metadata/<sample>
//Display each key/value pair from the metadata JSON object somewhere on the page
//Update the metadata for each sample that is selected
function DisplayMetadata(dropdown_value)
{
    var metadataUrl = "/metadata/"+dropdown_value;
            Plotly.d3.json(metadataUrl,function(error2,response2){
               var metadataSpanEle = document.getElementById("metadataSpan");
               metadataSpanEle.innerHTML = "AGE: "+ response2.AGE;
               metadataSpanEle.innerHTML += "</br>BBTYPE: "+ response2.BBTYPE;
               metadataSpanEle.innerHTML += "<br/>ETHNICITY: "+ response2.ETHNICITY;
               metadataSpanEle.innerHTML += "<br/>GENDER: "+ response2.GENDER;
               metadataSpanEle.innerHTML += "<br/>LOCATION: "+ response2.LOCATION;
               metadataSpanEle.innerHTML += "<br/>SAMPLEID: "+ response2.SAMPLEID;
            });
}

function DrawCharts(dropdown_value)
{
    var sample_url="/samples/"+dropdown_value;
    var otu_id_array = new Array();
    var sample_value_array = new Array();
    Plotly.d3.json(sample_url, function(error, response){  
        for(var i=0;i<response.length;i++)
        {
            otu_id_array=response[0]["otu_id"]
            sample_value_array=response[0]["sample_values"]
        }
        var  otu_disc_url="/otu";
        Plotly.d3.json(otu_disc_url,function(error1,response1){
            var otu_data=response1;
            var hovertext_array = new Array();
            for(var i=0;i<otu_id_array.length;i++)
                hovertext_array[i]=otu_data[otu_id_array[i]-1];

            DrawPieChart(sample_value_array,otu_id_array,hovertext_array);
            DrawBubbleChart(sample_value_array,otu_id_array,hovertext_array)
        }); 
    }); 
}
//Create a PIE chart that uses data from your routes /samples/<sample> 
//and /otu to display the top 10 samples.
//Use the Sample Value as the values for the PIE chart
//Use the OTU ID as the labels for the pie chart
//Use the OTU Description as the hovertext for the chart
function DrawPieChart(sample_value_array,otu_id_array,hovertext_array)
{
    var sample_value_array = sample_value_array.slice(0,10);
    var otu_id_array = otu_id_array.slice(0,10);
    var hovertext_array = hovertext_array.slice(0,10);

    var pie_divElement = document.getElementById("pie_div");
    if (pie_divElement.innerHTML == "") {
        var data = [{
            values: sample_value_array,
            labels: otu_id_array,
            hovertext: hovertext_array,
            type: "pie"
        }];
        var layout = {
            widht: 500,
            height: 500,
            title:"Pie Chart"
        };
        Plotly.newPlot(pie_divElement, data, layout);
    }
    //Use Plotly.restyle to update the chart whenever a new sample is selected
    else {
        Plotly.restyle(pie_divElement, "values", [sample_value_array]);
        Plotly.restyle(pie_divElement, "labels", [otu_id_array]);
        Plotly.restyle(pie_divElement, "hovertext", [hovertext_array]);
    }
}
//Create a BUBBLE Chart that uses data from your routes /samples/<sample>
// and /otu to plot the Sample Value vs the OTU ID for the selected sample.
//Use the OTU IDs for the x values
//Use the Sample Values for the y values
//Use the Sample Values for the marker size
//Use the OTU IDs for the marker colors
//Use the OTU Description Data for the text values
function DrawBubbleChart(sample_value_array,otu_id_array,hovertext_array)
{
    var bubble_divElement = document.getElementById("bubble_div");
    if (bubble_divElement.innerHTML == "") {
        var data = [{
            x: otu_id_array,
            y: sample_value_array,            
            text: hovertext_array,
            type:'scatter',
            mode: 'markers',
            marker: {
                color: otu_id_array,
                colorscale: "Rainbow",
                opacity: .8,
                size:sample_value_array
            },
            
        }];
        var layout = {
            title: 'Bubble Chart',
            hovermode:'closest',
            showlegend: false,
            height: 600,
            width: 1200,
            xaxis:{showline :false,title:"Otu Id"},
            yaxis:{showline :false,title:"Sample Values"}
        };
        Plotly.newPlot(bubble_divElement, data, layout);
    }
    //Use Plotly.restyle to update the chart whenever a new sample is selected
    else {
        Plotly.restyle(bubble_divElement, "y", [sample_value_array]);
        Plotly.restyle(bubble_divElement, "x", [otu_id_array]);
        Plotly.restyle(bubble_divElement, "hovertext", [hovertext_array]);

        Plotly.restyle(bubble_divElement, "marker.size", [sample_value_array]);
        Plotly.restyle(bubble_divElement, "marker.color", [otu_id_array]);
    }
}















 