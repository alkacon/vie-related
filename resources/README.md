## OpenCms Integration steps

#### In this folder you'll find all resources used to integrate related image search into OpenCms


### Steps to compile OpenCms with vie-realted integration for TinyMCE:

1. Checkout opencms branch dev_8_5_0
2. Checkout acacia-editor from https://ruKurz@github.com/ruKurz/acacia-editor.git
3. Build the acacia-editor project with ant (build.xml)
4. Copy the compiled jars (acacia-client.jar, acacia.jar) into the dev_8_5_0 compile/runtime directory
5. Build OpenCms with all modules


### Steps to setup OpenCms together with vie-realted

1. Install the previous compiled OpenCms
2. After logging into OpenCms replace the detail.jsp from the v8 article module with the detail.jsp from this folder
3. Copy the following files from the resources folder of this project into $CATALINA_HOME/webapps/opencms/resources/enhance:
    - jquery.rdfquery.min.js
    - vie.widget.image_search.js
    - vie.widget.related.js
4. Replace: $CATALINA_HOME/webapps/opencms/resources/ade/vieJS/vie-latest-ALL.debug.js with the vie-ALL-${build_info}.debug.js inside this folder
5. Done


### Steps to test vie-related:

1. Navigate to a article with your browser
2. Activate the tool bar and start to edit the article with acacia
3. For HTML widget fields the image search button should appear
4. Hit the image search button and you should find some images


### Steps to change the stanbol instance used by vie-related:

- By default the http://dev.iks-project.eu:8080 is used as stanbol server
- You can change it by editing vie.widget.related.js line 18 and following


#### Powered by:

<img src="http://www.alkacon.com/export/system/modules/org.opencms.website.template/resources/img/logo/logo_alkacon.gif" />
<img src="http://www.opencms.org/export/system/modules/org.opencms.website.template/resources/img/logo/logo_opencms.gif" />
<img src="http://www.alkacon.com/system/modules/org.opencms.website.template/resources/img/logo/iks-logo.png" />
<img src="http://www.alkacon.com/system/modules/org.opencms.website.template/resources/img/logo/vie_logo.png" />
