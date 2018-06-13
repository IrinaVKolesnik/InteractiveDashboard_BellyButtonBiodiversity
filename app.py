# Imports
import numpy as np
import pandas as pd
import datetime as dt
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, desc, select, extract
from sqlalchemy.ext.automap import automap_base


# Database Setup

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite",echo=False)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
OTU = Base.classes.otu
Sample_name = Base.classes.samples
Sample_metadata= Base.classes.samples_metadata

# Create our session (link) from Python to the DB
session = Session(engine)

# Flask  Setup and Routes

app = Flask(__name__)

# Create route that renders index.html template
@app.route("/")
def index():
    return render_template("index.html")
    
# Use the route `/names` to populate a dropdown select element with the list of sample names.
@app.route('/names')
def sample_names():
    sample_names_list = [c.key for c in Sample_name.__table__.columns if c.key!='otu_id']
    print(sample_names_list)
    all_samplenames = list(np.ravel( sample_names_list))
    return jsonify(all_samplenames) 

    """List of sample names.

    Returns a list of sample names in the format
    [
        "BB_940",
        "BB_941",
        "BB_943",
        "BB_944",
        "BB_945",
        "BB_946",
        "BB_947",
        ...
    ]

    """


@app.route('/otu')
def otu():
    all_otu = session.query(OTU.lowest_taxonomic_unit_found).all()
    all_names = list(np.ravel(all_otu))       
    return jsonify(all_names)

    """List of OTU descriptions.

    Returns a list of OTU descriptions in the following format

    [
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Bacteria",
        "Bacteria",
        "Bacteria",
        ...
    ]
    """

@app.route('/metadata/<sample>')
def metadata(sample):
    sampleid = sample.split('_')[1]
    sample_data=session.query(Sample_metadata).filter(Sample_metadata.SAMPLEID==sampleid).one() 
    metadata_dict={}
    metadata_dict["AGE"]=sample_data.AGE
    metadata_dict["BBTYPE"]=sample_data.BBTYPE
    metadata_dict["ETHNICITY"]=sample_data.ETHNICITY
    metadata_dict["GENDER"]=sample_data.GENDER
    metadata_dict["LOCATION"]=sample_data.LOCATION
    metadata_dict["SAMPLEID"]=sample_data.SAMPLEID      
    return jsonify(metadata_dict)  

    """MetaData for a given sample.
    Args: Sample in the format: `BB_940`
    Returns a json dictionary of sample metadata in the format
    {
        AGE: 24,
        BBTYPE: "I",
        ETHNICITY: "Caucasian",
        GENDER: "F",
        LOCATION: "Beaufort/NC",
        SAMPLEID: 940
    }
    """
      
@app.route('/wfreq/<sample>')
def weeklydata(sample):
    sample_data=session.query(Sample_metadata.WFREQ).all()
    all_values = list(np.ravel(sample_data))       
    return jsonify(all_values)

    """Weekly Washing Frequency as a number.    
    Args: Sample in the format: `BB_940`
    Returns an integer value for the weekly washing frequency `WFREQ`
    """


@app.route('/samples/<sample>')
def RetunSampleData(sample):
    sort_values= session.query(Sample_name.otu_id,sample).order_by(sample+" desc").limit(100).all()
    result = [{"otu_id" : [c[0] for c in sort_values],
          "sample_values" : [c[1] for c in sort_values]}]
    return jsonify(result)

    """OTU IDs and Sample Values for a given sample.
    Sort your Pandas DataFrame (OTU ID and Sample Value)
    	in Descending Order by Sample Value
    Return a list of dictionaries containing sorted lists  for `otu_ids`
    	and `sample_values`
    [
        {
            otu_ids: [
                1166,
                2858,
                481,
                ...
            ],
            sample_values: [
                163,
                126,
                113,
                ...
            ]
        }
        """
  
if __name__ == '__main__':
    app.run(debug=True)
