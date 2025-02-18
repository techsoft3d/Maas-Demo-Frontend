// Utility: Ground Plane
/*
Global variables used:
- Communicator
- hwv
- featureNode
- mainModelNode
- activeBtnColor
- inactiveBtnColor
*/
let featuresModalOpen = false;

function setupDetectFeatures() {
    const featuresModal = document.getElementById("featuresModal");
    const detectFeaturesBtn =  document.getElementById("detectFeaturesBtn");
    detectFeaturesBtn.addEventListener("click", async ()=>{
              
        if (!featuresModalOpen) {
            featuresModal.style.display = "block";
            featuresModalOpen = true;
            detectFeaturesBtn.style.backgroundColor = activeBtnColor;
            if (featuredNode) {
                await hwv.model.setNodesVisibility([featuredNode], true);
                await hwv.model.setNodesOpacity([mainModelNode], parseFloat(document.getElementById("partOpacity").value));
            }
            else {
                detectFeatures();
            }
        }
        else {
            featuresModal.style.display = "none";
            detectFeaturesBtn.style.backgroundColor = inactiveBtnColor;
            featuresModalOpen = false;
            await hwv.model.setNodesVisibility([featuredNode], false);
            await hwv.model.setNodesOpacity([mainModelNode], 1.0);
        }
    });
    document.getElementById("partOpacity").addEventListener("input", (e)=>{
        hwv.model.setNodesOpacity([mainModelNode], e.target.value);
    })
}

const FeatureType = Object.freeze({ // These values correspond to a FeatureType enum on the PG server
    HOLE: 0, 
	PLANE: 1, 
	POCKET: 2, 
	ISLAND: 3, 
	DRILLED: 4
});


async function detectFeatures() {

    document.getElementById("loading").style.display = "block";

    if (modelUuid == 0) {
        alert("No model detected. Please try uploading a new model.")
        document.getElementById("loading").style.display = "none";
        return;
    }

    var oReq = new XMLHttpRequest();
    oReq.open("POST", ServerURL + "/pgServer/DetectFeatures", true);
    oReq.setRequestHeader("Content-Type", "text/plain"); 
    oReq.responseType = "arraybuffer";

    oReq.onreadystatechange = function (oEvent) {
        if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
            var float32Array = new Float32Array(oReq.response);
            if (float32Array) {
                // We receive an array [featuretype, x, y, z, featuretype, x, y, z, featuretype ... # planes, # holes, #pockets, #islands, #drilled]
                
                let vertexColors = [];
                let pts = [];
  
                for (let i=0; i<float32Array.length-5; i+=4) {
                    
                    let featureType = float32Array[i];
                    
                    switch (featureType) {
                        case FeatureType.HOLE:
                            vertexColors.push(0, 255, 0, 255);
                            break;
                        case FeatureType.POCKET:
                            vertexColors.push(0, 255, 255, 255);
                            break;
                        case FeatureType.DRILLED:
                            vertexColors.push(0, 255, 255, 255);
                            break;
                        default:
                            // Do nothing
                            continue;
                    }
                    
                    pts.push(float32Array[i+1], float32Array[i+2], float32Array[i+3]);
                }
                
                // Update the feature counts:
                // document.getElementById("featureCountPlane").innerHTML = float32Array[float32Array.length-5];
                document.getElementById("featureCountHole").innerHTML = float32Array[float32Array.length-4];
                document.getElementById("featureCountPocket").innerHTML = float32Array[float32Array.length-3] + float32Array[float32Array.length-1]; // PG seems to usually detect blind holes as pockets
                // document.getElementById("featureCountIsland").innerHTML = float32Array[float32Array.length-2];
                // document.getElementById("featureCountDrilled").innerHTML = float32Array[float32Array.length-1];
                
                renderFeatures(pts, vertexColors);
            }
        }
    }
    oReq.send(modelUuid);
    oReq.onerror = ()=>{
        alert("Failed analysis. Please try again or contact us.");
        document.getElementById("loading").style.display = "none";
    }

}

function renderFeatures(points, vertexColors) {
    const nodeMatrix = hwv.model.getNodeMatrix(mainModelNode);
	
    let meshData = new Communicator.MeshData();
    meshData.setFaceWinding(Communicator.FaceWinding.CounterClockwise);
    meshData.addFaces(points, null, vertexColors);

    const nodeUnitMultiplier = hwv.model.getNodeUnitMultiplier(mainModelNode);

    hwv.model.createMesh(meshData).then((meshId) => {
        let meshInstanceData = new Communicator.MeshInstanceData(meshId);
        meshInstanceData.setMatrix(nodeMatrix);
        const originalMatrix = hwv.model.getNodeNetMatrix(mainModelNode);
        hwv.model.createMeshInstance(meshInstanceData).then((instacdId) => {
            hwv.model.setNodesOpacity([mainModelNode], 0.1);
            featuredNode = instacdId;
            document.getElementById("loading").style.display = "none";
            if (hwv.model.getModelFileTypeFromNode(mainModelNode) === Communicator.FileType.Inventor) {
                // TODO: Fix scaling issue
                const scaleMatrix = new Communicator.Matrix();
                scaleMatrix.setScaleComponent(10/nodeUnitMultiplier,10/nodeUnitMultiplier,10/nodeUnitMultiplier);
                hwv.model.setNodeMatrix(instacdId, Communicator.Matrix.multiply(scaleMatrix, originalMatrix));
            }
            else {
                const scaleMatrix = new Communicator.Matrix();
                scaleMatrix.setScaleComponent(1/nodeUnitMultiplier,1/nodeUnitMultiplier,1/nodeUnitMultiplier);
                hwv.model.setNodeMatrix(instacdId, Communicator.Matrix.multiply(scaleMatrix, originalMatrix));
            }
        });
    });
}