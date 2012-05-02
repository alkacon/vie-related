## OpenCms integration resources for related image search
#### In this folder you'll find the resources used to integrate related image search into OpenCms


### Dependencies:

- VIE compiled from: https://ruKurz@github.com/ruKurz/VIE.git
- jQuery UI


#### Steps to compile OpenCms with vie-realted integration for TinyMCE:

1. Checkout opencms branch dev_8_5_0
2. Checkout acacia-editor from https://ruKurz@github.com/ruKurz/acacia-editor.git
3. Build the acacia-editor project with ant (build.xml)
4. Copy the compiled jars (acacia-client.jar, acacia.jar) into the dev_8_5_0 compile/runtime directory
5. Build OpenCms with all modules


### Steps to setup OpenCms together with vie-realted

1. Install OpenCms from the related.war
2. After logging into OpenCms replace the detail.jsp from the v8 article module with the detail.jsp from this folder
3. Extract the content from the enhance.zip inside this folder to $CATALINA_HOME/webapps/opencms/resources/enhance
4. Replace: $CATALINA_HOME/webapps/opencms/resources/ade/vieJS/vie-latest-ALL.debug.js with the vie-ALL-2.0.0_20120427160044.debug.js inside this folder
5. Done


#### Steps to test vie-related:

1. Navigate to a article with your browser
2. Activate the tool bar and start to edit the article with acacia
3. For HTML widget fields the image search button should appear
4. Hit the image search button and you should find some images


#### How to change the stanbol instance used by vie-related:

- By default the http://dev.iks-project.eu:8080 is used as stanbol server
- You can change it by editing $CATALINA_HOME/webapps/opencms/resources/enhance/enhancement.js
- Round about line 18 you find the server used by vie-related you can enter a custom URL for a stanbol server here
- For testing the flower content you can start the stanbol server from the stanbol folder by running the stanbol/startup.sh or
- You can start the stanbol intance directly by: java -jar -Xmx1g org.apache.stanbol.launchers.full-0.9.0-incubating-SNAPSHOT.jar -p 8085
- After stanbol server is up and running copy the file dbpedia-index/dist_plants/plants.solrindex.zip to sling/datafiles
- Afterwards goto localhost:8085/system/colsole and log in (User: admin, Pass: admin)
- In the bundles tab add a new bundle for dbpedia-index/dist_plants/org.apache.stanbol.data.site.plants-1.0.0.jar
- In the configuration tab search for the keywordlinking engine and add a new one named: "plantsExtraction" with referenced site "plants"
