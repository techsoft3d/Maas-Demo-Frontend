// Utility: Overhang Detection
/*
Global variables used:
- Communicator
- hwv
- overhangModelNodes
- mainModelNode
- activeBtnColor
- inactiveBtnColor
*/

let overhangsModalOpen = false;

function setupDetectOverhangs() {
    const detectOverhangsBtn = document.getElementById("detectOverhangsBtn");
    detectOverhangsBtn.addEventListener("click", async ()=> {
        const overhangsModal = document.getElementById("overhangsModal");
        if (!overhangsModalOpen) {
            overhangsModal.style.display = "block";
            overhangsModalOpen = true;
            if (overhangModelNodes.length !== 0) {
                await hwv.model.setNodesVisibility(overhangModelNodes, true);
                await hwv.model.setNodesVisibility([mainModelNode], false);
            }
            if (activeButton != null) {
                resetModals(activeButton, activeModal);
            }
            activeButton = detectOverhangsBtn;
            activeModal = overhangsModal;
            detectOverhangsBtn.style.backgroundColor = activeBtnColor;
        }
        else {
            overhangsModal.style.display = "none";
            if (overhangModelNodes.length !== 0) {
                await hwv.model.setNodesVisibility(overhangModelNodes, false);
            }
            await hwv.model.setNodesVisibility([mainModelNode], true);
            overhangsModalOpen = false;
            detectOverhangsBtn.style.backgroundColor = inactiveBtnColor;
            activeButton = null;
            activeModal = null;
        }
       
    });

    // Set up the slider:
    const overhangAngle = document.getElementById("overhangAngle");
    overhangAngle.addEventListener("input", (e)=>{
        const currentAngle = e.target.value;
        document.getElementById("overhangAngleValue").innerHTML = e.target.value;
        detectOverhangs(currentAngle);
    })
}

async function detectOverhangs(angle) {
    // Get all the normal vertices of the model
    // For each vertex, get its angle relative the the z-axis
    // If that angle is greater than the angle parameter, then change the vertex color to red
    if (overhangModelNodes.length !== 0) {
        for (let i=0; i<overhangModelNodes.length; i++) {
            try {
                await hwv.model.deleteNode(overhangModelNodes[i]);
            }
            catch(err) {
                alert(err);
            }
        }
    }

    overhangModelNodes = [];

    // Get bottom bounds of node:
    const bounds = await hwv.model.getNodesBounding([mainModelNode],{tightBounding: true});
    let zMin = bounds.min.z;

    leaves.forEach((child)=>{

        hwv.model.getNodeMeshData(child).then((originalMesh) => {
            
            const netMatrix = hwv.model.getNodeNetMatrix(child);
            const nodeMatrix = hwv.model.getNodeMatrix(child);

            const nodeUnitMultiplier = hwv.model.getNodeUnitMultiplier(child);
            const meshData = new Communicator.MeshData();

            const zVector = new Communicator.Point3(0,0,-1);

            let counter = 0;
            let triangleArr = [];
            const faceArr = [];
            const colorArr = [];
            let arrCount = 0;
            const normals = [];

            for (element of originalMesh.faces) {
                counter++;
                const pointArr = [];
                for (let i=0; i<3; i++) { // get x, y, z
                    triangleArr.push(element.position[i]);//*nodeUnitMultiplier);
                    faceArr.push(element.position[i]);//*nodeUnitMultiplier);
                    pointArr.push(element.position[i]);//*nodeUnitMultiplier);
                    normals.push(element.normal[i]);

                }

                //Get the appropriate angles values for coloring:
                // current normal vector:
                const normalVectorOriginal = new Communicator.Point3(normals[normals.length-3], normals[normals.length-2], normals[normals.length-1]);
              
                // transform the normal vector by the net matrix (reset translation elements to zero since translation does not effect normal vectors):
                let normNetMatrix = netMatrix.copy();
                normNetMatrix.m[12] = 0;
                normNetMatrix.m[13] = 0;
                normNetMatrix.m[14] = 0;
                normNetMatrix.m[15] = 0;
                const normalVector = normNetMatrix.transform(normalVectorOriginal)
                

                const angleToCheckRadians = Math.acos((Communicator.Point3.dot(normalVector, zVector))/(Math.sqrt(normalVector.squaredLength())*Math.sqrt(zVector.squaredLength())));
                const angleToCheckDeg = angleToCheckRadians*180/3.14;
                
                
                let transformedZ = netMatrix.transform(new Communicator.Point3(pointArr[pointArr.length-3],pointArr[pointArr.length-2],pointArr[pointArr.length-1])).z;
                
                if (angleToCheckDeg < angle && Math.round(transformedZ*100)/100 !== Math.round(zMin*100)/100) {
                    // make the color of this vertex red
                    colorArr.push(255,0,0,255);
                }
                else { // make the color the current node color
                    colorArr.push(0,255,100,255);
                }

                arrCount+=4;

                if (counter % 3 == 0) { // once the three vertices of a triangle are captured, repeat the first vertex to close the triangle
                    for (let j=0; j<9; j++) {
                        triangleArr.push(triangleArr[j])
                    }
                    //meshData.addPolyline(triangleArr);
                    triangleArr = [];
                }
            
            }

            meshData.addFaces(faceArr, null, colorArr);

            hwv.model.createMesh(meshData).then((meshId) => {
                const meshInstanceData = new Communicator.MeshInstanceData(meshId);
                meshInstanceData.setMatrix(nodeMatrix); // set in original position
                const originalMatrix = hwv.model.getNodeNetMatrix(mainModelNode);
                // meshInstanceData.setLineColor(new Communicator.Color(0,0,0));
                hwv.model.createMeshInstance(meshInstanceData,null,null,false).then((nodeId) => {
                    hwv.model.setNodesVisibility([mainModelNode], false);
                    overhangModelNodes.push(nodeId);
                    if (hwv.model.getModelFileTypeFromNode(mainModelNode) === Communicator.FileType.Inventor) {
                        // TODO: Fix scaling issue
                        const newMat = nodeMatrix.copy().setScaleComponent(10/nodeUnitMultiplier,10/nodeUnitMultiplier,10/nodeUnitMultiplier);
                        hwv.model.setNodeMatrix(nodeId, Communicator.Matrix.multiply(newMat, originalMatrix));
                    }
                    else {
                        hwv.model.setNodeMatrix(nodeId, originalMatrix);
                    }

                });
            });
        });
    });
}