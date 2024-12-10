// Utility: Wall Thickness Analysis
/*
Global variables used:
- Communicator
- hwv
- mainModelNode
- modelUuid
- activeBtnColor
- inactiveBtnColor
*/

let thinWallData = new Object();

let thinWallModalOpen = false;

function setupThinWalls() {
    const thinWallModal = document.getElementById("thinWallModal");
    const wallThicknessBtn = document.getElementById("wallThicknessBtn");
    wallThicknessBtn.addEventListener("click", async ()=>{
        if (thinWallModalOpen) {
            thinWallModal.style.display = "none";
            thinWallModalOpen = false;
            wallThicknessBtn.style.backgroundColor = inactiveBtnColor;
            if (thinWallNode !== null) {
                await hwv.model.setNodesVisibility([thinWallNode], false);
                await hwv.model.setNodesVisibility([mainModelNode], true);
            }
        }    
        else {
            thinWallModal.style.display = "block";
            thinWallModalOpen = true;
            displayThinWalls();
            wallThicknessBtn.style.backgroundColor = activeBtnColor;
            if (thinWallNode !== null) {
                await hwv.model.setNodesVisibility([thinWallNode], true);
                await hwv.model.setNodesVisibility([mainModelNode], false);
            }
        }
    });
    

    // Set event listener for color and set points:
    const wallThicknessElements = document.querySelectorAll(".thicknessInput");
    wallThicknessElements.forEach((ele)=>{
        ele.addEventListener("change", (e)=>{
            hwv.model.deleteNode(thinWallNode).then(()=>{
                renderThinWalls();
                // Update the readouts:
                if (e.target.type != "color") {
                    document.getElementById(`${e.target.id}Out`).innerHTML = e.target.value;
                }
            });
        })
    });
}


async function displayThinWalls() {
    if (!thinWallNode) {
        document.getElementById("loading").style.display = "block";

        var oReq = new XMLHttpRequest();
        // oReq.open("GET", ServerURL + "/WallThickness", true);
        oReq.open("POST", ServerURL + "/pgServer/WallThickness", true);
	    oReq.setRequestHeader("Content-Type", "text/plain"); 
        oReq.responseType = "arraybuffer";

        oReq.onreadystatechange = function (oEvent) {
            if (oReq.readyState === XMLHttpRequest.DONE && oReq.status === 200) {
                var float32Array = new Float32Array(oReq.response);
                if (float32Array) {
                    // we receive an array  [x1, y1, z1, v1, x2, y2, z2, v2, ...]
                    thinWallData.meshPts = [];
                    thinWallData.ptVals = [];
                    thinWallData.max = -Infinity;
                    thinWallData.min = Infinity;

                    for (let i=0; i<float32Array.length; i++) {
                        if ((i+1)%4 == 0) {
                            thinWallData.ptVals.push(float32Array[i]);
                            if (float32Array[i] > thinWallData.max) thinWallData.max = float32Array[i];
                            if (float32Array[i] < thinWallData.min) thinWallData.min = float32Array[i];
                        }
                        else {
                            thinWallData.meshPts.push(float32Array[i]);
                        }
                    }
                    renderThinWalls();
                }
            }
        }
        oReq.send(modelUuid);
        oReq.onerror = ()=>{
            alert("Failed analysis. Have you uploaded a model yet?")
            document.getElementById("loading").style.display = "none";
        }
    }
    else {
        hwv.model.deleteNode(thinWallNode).then(()=>{
            renderThinWalls();
        });
    }
}



// Read the set points and colors for each setpoint:
function renderThinWalls() {
    
    if (document.getElementById("loading").style.display == "none") {
        document.getElementById("loading").style.display = "block";
    }

    const nodeMatrix = hwv.model.getNodeMatrix(mainModelNode);
	let colors = [];

    let setPt1 = document.getElementById("thinWallVal1").value;
    let setColor1 = hexToRgb(document.getElementById("thinWallColor1").value);
    let setPt2 = document.getElementById("thinWallVal2").value;
    let setColor2 = hexToRgb(document.getElementById("thinWallColor2").value);
    let setPt3 = document.getElementById("thinWallVal3").value;
    let setColor3 = hexToRgb(document.getElementById("thinWallColor3").value);
    let setPt4 = document.getElementById("thinWallVal4").value;
    let setColor4 = hexToRgb(document.getElementById("thinWallColor4").value);
    let setColor5 = hexToRgb(document.getElementById("thinWallColor5").value);

    for (let i=0; i<thinWallData.ptVals.length; i++) {
        if (thinWallData.ptVals[i] < setPt1){
            colors.push(
                setColor1.rgbR,
                setColor1.rgbG,
                setColor1.rgbB,
                255
            );
        }
        else if (thinWallData.ptVals[i] > setPt1 && thinWallData.ptVals[i] < setPt2){
            colors.push(
                setColor2.rgbR,
                setColor2.rgbG,
                setColor2.rgbB,
                255
            );
        }
        else if (thinWallData.ptVals[i] > setPt2 && thinWallData.ptVals[i] < setPt3){
            colors.push(
                setColor3.rgbR,
                setColor3.rgbG,
                setColor3.rgbB,
                255
            );
        }
        else if (thinWallData.ptVals[i] > setPt3 && thinWallData.ptVals[i] < setPt4){
            colors.push(
                setColor4.rgbR,
                setColor4.rgbG,
                setColor4.rgbB,
                255
            );
        }
        else {
            colors.push(
                setColor5.rgbR,
                setColor5.rgbG,
                setColor5.rgbB,
                255
            );
        }
    }

    let meshData = new Communicator.MeshData();
    meshData.setFaceWinding(Communicator.FaceWinding.CounterClockwise);
    meshData.addFaces(thinWallData.meshPts, null, colors); 

    hwv.model.createMesh(meshData).then((meshId) => {
        const nodeUnitMultiplier = hwv.model.getNodeUnitMultiplier(mainModelNode);
        let meshInstanceData = new Communicator.MeshInstanceData(meshId);
        meshInstanceData.setMatrix(nodeMatrix);
        const originalMatrix = hwv.model.getNodeNetMatrix(mainModelNode);
        hwv.model.createMeshInstance(meshInstanceData).then((instacdId) => {
            hwv.model.setNodesVisibility([mainModelNode], false);
            thinWallNode = instacdId;
            document.getElementById("loading").style.display = "none";
            hwv.model.setNodeMatrix(instacdId, originalMatrix);
            if (hwv.model.getModelFileTypeFromNode(mainModelNode) === Communicator.FileType.Inventor) {
                // TODO: Fix scaling issue
                const scaleMatrix = new Communicator.Matrix();
                scaleMatrix.setScaleComponent(10/nodeUnitMultiplier,10/nodeUnitMultiplier,10/nodeUnitMultiplier);
                hwv.model.setNodeMatrix(instacdId, Communicator.Matrix.multiply(scaleMatrix, originalMatrix));
            }
            else {
                hwv.model.setNodeMatrix(instacdId, originalMatrix);
            }
        });
    });
    
    
}