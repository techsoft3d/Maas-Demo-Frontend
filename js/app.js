let hwv; // Allow global access to web viewer for easy debugging / browser console interaction

//let ServerURL = "https://cloud.techsoft3d.com/PgServer";
let ServerURL = "https://maas-backend.techsoft3d.com";

let modelUuid = 0; // model UUID to request from the server
let mainModelNode;
let leaves = [];
let overhangModelNodes = [];
let thinWallNode = null;
let groundPlane;
let featuredNode = null;
let firstUpload = true;

window.onload = () => {

    // Connect to PG server:
    if (window.document.URL.includes("localhost")) {
        //len = window.document.URL.indexOf("demos") - 1;
        //ServerURL = window.document.URL.substring(0, len) + "/PgServer";
        ServerURL = "http://localhost:8888";

    }

    fetch(ServerURL + "/pgServer/api/run_pgserver", {
        method: "POST"
    }).then((res) => {
        if (res.ok) {
            console.log("PG server live!");
        }
        else {
            console.log("Unable to connect to PG server.")
        }
    }).catch((e) => {
        console.log("Error fetching PG server: " + e);
    })

    // Start a webviewer:
    hwv = new Communicator.WebViewer({
        containerId: "viewer",
        //endpointUri: "../models/push rod.scs" // used for faster debugging
        empty: true
    });

    window.onresize = () => {
        hwv.resizeCanvas();
    };

    const backgroundColor1 = new Communicator.Color(255,255,255);
    const backgroundColor2 = new Communicator.Color(200,200,200);

    hwv.model.setEnableAutomaticUnitScaling(false);
 
    hwv.setCallbacks({
        sceneReady: () => {
            hwv.view.setBackgroundColor(backgroundColor2,backgroundColor1);
            hwv.view.getAxisTriad().enable();

            hwv.view.setTransparencyMode(Communicator.TransparencyMode.Unsorted);
            hwv.view.setBackfacesVisible(true);
            //hwv.view.setProjectionMode(Communicator.Projection.Perspective);

            fetch("images/studio.ktx2").then((iblData) => {
                if (iblData.ok) {
                    iblData.blob().then((blob)=>{
                        const reader = new FileReader();

                        reader.onload = () => {
                                const byteArray = new Uint8Array(reader.result);
                                hwv.view.setImageBasedLightingEnvironment(byteArray);
                                hwv.view.setImageBasedLightingIntensity(0.5);
                                hwv.view.setAmbientOcclusionEnabled(true);
                        };
                        reader.readAsArrayBuffer(blob);
                    }).catch((err)=>{
                        console.log("Failed to set IBL.");
                        console.error(err);
                    });                    
                }
            }).catch((err)=>{
                console.log("Failed to fetch IBL data.");
                console.error(err);
            });
            

        },
        modelStructureReady: async () => {
            mainModelNode = hwv.model.getNodeChildren(hwv.model.getAbsoluteRootNode())[0];

            // Create a ground plane and ground the model (needed for overhang detection):
            createGroundPlane();
            //await groundModel();

            setupEventListeners();

            // Uncomment these if directly loading scs file in web viewer instantiation:
            // populateInfoPanel(mainModelNode); 
            // hwv.view.fitWorld();

            generateModelTree();
        }
    })

    hwv.start();

    // Close server session:
    window.onbeforeunload = () => {
        let oReq = new XMLHttpRequest();
        oReq.open("POST", ServerURL + "/pgServer/CloseUuidSession", true);
	    oReq.setRequestHeader("Content-Type", "text/plain"); 
        oReq.onreadystatechange = function (oEvent) {
            if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
                console.log("Solid Destroyed");
            }
        }
        oReq.send(modelUuid);
        // oReq.open("GET", ServerURL + "/CloseSession", true);
        // oReq.responseType = "arraybuffer";
        // oReq.onreadystatechange = function (oEvent) {
        //     if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
        //         console.log("Solid Destroyed");
        //         document.getElementById("hollow").innerHTML = Hollow;
        //         hollowed = false;
        //     }
        // }
        // oReq.send(null);
    }


    let el = document.getElementById("viewer");
    if (el.addEventListener) {
        el.addEventListener("dragover", function (ev) { dragover_handler(ev); });
        el.addEventListener("drop", function (ev) { drop_handler(ev); });
    }

}

function handleUpload(e, defaultFile=null) {
    const loadingDiv = document.getElementById("loading");
    loadingDiv.style.display = "block";
    let modelFile;
    if (defaultFile == null) {
        modelFile = e.target.files[0];
    }
    else {
        modelFile = defaultFile;
    }

    // fetch(ServerURL + "/CloseSession", {
    //     method: "GET",
    //     responseType: "arraybuffer"
    // }).then((res) => {
    let oReq = new XMLHttpRequest();
    oReq.open("POST", ServerURL + "/pgServer/CloseUuidSession", true);
    oReq.setRequestHeader("Content-Type", "text/plain"); 
    oReq.onreadystatechange = function (oEvent) {
        if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
            const oReq2 = new XMLHttpRequest();
            oReq2.open("POST", ServerURL + "/pgServer/" + modelFile.name, true);
            oReq2.setRequestHeader("Content-type", "multipart/form-data");

            oReq2.responseType = "arraybuffer";
            oReq2.onreadystatechange = async () => {
                if (oReq2.readyState == XMLHttpRequest.DONE && oReq2.status == 200) {
                    const scsBuffer = oReq2.response;
                    if (scsBuffer && scsBuffer.byteLength > 0) {
                        // clear the viewer:
                        await hwv.pauseRendering();
                        await hwv.model.clear();
                        createGroundPlane();

                        // Load the scs from the buffer:
                        // First, parse the buffer to extract the SCS buffer and the UUID. The UUID is 128 bits (plus 4 dashes):
                        const responseArray = new Uint8Array(scsBuffer)
                        const uuidSize = 128/4+4;
                        const scsData = responseArray.subarray(0, responseArray.length-uuidSize);
                        const uuidData = responseArray.subarray(responseArray.length-uuidSize);
                        modelUuid = new TextDecoder().decode(uuidData);
                        
                        mainModelNode = (await hwv.model.loadSubtreeFromScsBuffer(hwv.model.getAbsoluteRootNode(), scsData))[0];

                        // Hide any PMI:
                        await setupPmi();

                        populateInfoPanel(mainModelNode);
                        generateModelTree();
                        await groundModel();
                        hwv.view.fitWorld();
                        loadingDiv.style.display = "none";
                        await hwv.resumeRendering();

                        if (firstUpload) {
                            setTimeout(()=>{
                                document.getElementById("tourPrompt").style.display = "block";
                            }, 1000);
                        }
                        firstUpload = false;
                    
                    }
                }
            }
            oReq2.send(modelFile);
        }
    }
    oReq.send(modelUuid);
    oReq.onerror = ()=>{
        alert("Failed upload.")
        document.getElementById("loading").style.display = "none";
    }
}


function populateInfoPanel(nodeId) {
    const nodeName = hwv.model.getNodeName(nodeId);
    console.log("node name: " + nodeName);

    document.getElementById("modelName").innerHTML = nodeName;

    hwv.model.getNodeProperties(nodeId).then((props) => {
        // Communicator is expected to return at least a Volume and Surface Area property as strings:
        document.getElementById("modelVolume").innerHTML = props["Volume"];
        document.getElementById("modelSurfaceArea").innerHTML = props["Surface Area"];

    }).catch((e) => {
        console.log("Failed to get node properties.");
        console.error(e);
    });

    updateBounding(nodeId);

    // Reset the color and material:
    resetInputs();
}

function resetInputs() {
    document.getElementById("materialSelect").value = "";
}

function setupEventListeners() {
    setupMeasureOperators();

    setupModelOrientationBtn();

    setupGroundBtn();

    setupDetectOverhangs();

    setupThinWalls();

    setupDetectFeatures();

    setupCutPlanes();

    document.getElementById("uploadInput").addEventListener("change", (e)=>{
        handleUpload(e);
    });

    document.getElementById("uploadPrompt").addEventListener("click", async ()=>{
        document.getElementById("loadButton").click();
        closeIntroWindow();
    });

    // Option if user does not have a model to test with:
    document.getElementById("loadDemoModel").addEventListener("click", async ()=>{
        let response = await fetch('./models/housing back.CATPart');
        let blob = await response.blob();
        handleUpload(null, new File([blob], "Sample model"));
        closeIntroWindow();
    });

}


function setupModelOrientationBtn() {

    document.getElementById("upAxis").addEventListener("change", async (e)=>{
        const upAxis = e.target.value;
        hwv.pauseRendering();
        await hwv.model.resetNodeMatrixToInitial(mainModelNode);
        switch (upAxis) {
            case "xp":
                await hwv.model.setNodeMatrix(mainModelNode, Communicator.Matrix.yAxisRotation(90));
                break;
            case "yp":
                await hwv.model.setNodeMatrix(mainModelNode, Communicator.Matrix.xAxisRotation(-90));
                break;
            case "zp":
                // this is the default
                
                break;
            case "xn":
                await hwv.model.setNodeMatrix(mainModelNode, Communicator.Matrix.yAxisRotation(-90));
                break;
            case "yn":
                await hwv.model.setNodeMatrix(mainModelNode, Communicator.Matrix.xAxisRotation(90));
                break;
            case "zn":
                await hwv.model.setNodeMatrix(mainModelNode, Communicator.Matrix.xAxisRotation(180));
                break;

            default:
                console.log('invalid selection, setting default: model z-axis is up');
                
        }
        overhangModelNodes = [];
        thinWallNode = null;
        featuredNode = null;
        await groundModel();
        updateBounding(mainModelNode);
        //await hwv.view.fitWorld();
        hwv.resumeRendering();
    });
    
    
}

function updateBounding(nodeId) {
    // X: x is x, y is y, z is z
    hwv.model.getNodesBounding([nodeId], { tightBounding: true }).then((boundingBox) => {
        const modelLength = Math.round(10*(boundingBox.max.x - boundingBox.min.x))/10;
        const modelWidth = Math.round(10*(boundingBox.max.y - boundingBox.min.y))/10;
        const modelHeight = Math.round(10*(boundingBox.max.z - boundingBox.min.z))/10;

        let units;

        switch (hwv.model.getNodeUnitMultiplier(mainModelNode)) {
            case 1:
                units = "mm";
                break;
            case 25.4:
                units = "in";
                break;
            case 10: 
                units = "cm";
                break;
            case 100:
                units = "m";
                break;
            case 304.8: 
                units = "ft";
                break;
            default:
                console.log("Cannot read units");
                units = " unknown units";
        }

        document.getElementById("boundingLength").innerHTML = `${modelLength} ${units}`;
        document.getElementById("boundingWidth").innerHTML = `${modelWidth} ${units}`;
        document.getElementById("boundingHeight").innerHTML = `${modelHeight} ${units}`;
    });
}


let modelTree = "";
function generateModelTree() {
    modelTree = "";
    leaves = [];
    overhangModelNodes = [];
    thinWallNode = null;
    featuredNode = null;
    thinWallData = new Object();
    generateRecursive(hwv.model.getAbsoluteRootNode(), 0);
    document.getElementById("modelTree").innerHTML = modelTree;
}

function generateRecursive(nodeId, indent) {
    const type = hwv.model.getNodeType(nodeId);
    if (type === Communicator.NodeType.Part ||
        type === Communicator.NodeType.PartInstance ||
        type === Communicator.NodeType.AssemblyNode ||
        type === Communicator.NodeType.BodyInstance) {

        modelTree += `<p id=node${nodeId} style="margin-left: ${(indent * 10)}px">${nodeId}: ${hwv.model.getNodeName(nodeId)}`;
        const children = hwv.model.getNodeChildren(nodeId);
        if (children.length === 0) {
            leaves.push(nodeId);
        }
        for (let i = 0; i < children.length; i++) {
                generateRecursive(children[i], indent + 1);
        }
    }
}


async function groundModel() {
    // Scale model appropriately:
    let scaleMatrix = new Communicator.Matrix();
    const scale = hwv.model.getNodeUnitMultiplier(mainModelNode);
    scaleMatrix.setScaleComponent(scale, scale, scale);
    let nodeMatrix = hwv.model.getNodeMatrix(mainModelNode);
    const scaledMatrix = Communicator.Matrix.multiply(nodeMatrix,scaleMatrix);
    hwv.model.setNodeMatrix(mainModelNode, scaledMatrix);
    const modelBounding = await hwv.model.getModelBounding(true,false,true);
    nodeMatrix.setTranslationComponent(
        -modelBounding.min.x-(modelBounding.max.x-modelBounding.min.x)/2,
        -modelBounding.min.y-(modelBounding.max.y-modelBounding.min.y)/2,
        -modelBounding.min.z);
    await hwv.model.setNodeMatrix(mainModelNode, Communicator.Matrix.multiply(nodeMatrix,scaleMatrix));
    let groundPlane = hwv.view.getGroundPlane();
    groundPlane.position = new Communicator.Point3(0,0,0);
    hwv.view.setGroundPlane(groundPlane);  
}

// Hide PMI:
let pmiIds = [];
async function setupPmi() {
    const pmiMap = hwv.model.getPmis();
    pmiIds = [];

    for (const id in pmiMap) {
        pmiIds.push(parseInt(id));
    }

    await hwv.model.setNodesVisibility(pmiIds,false);
}

