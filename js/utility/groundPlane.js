// Utility: Ground Plane
/*
Global variables used:
- Communicator
- hwv
- groundPlane
*/

function setupGroundBtn() {
    const groundBtn = document.getElementById("groundBtn");
    groundBtn.addEventListener("click", async ()=>{
        const visibleGround = hwv.model.getNodeVisibility(groundPlane);
        if (visibleGround) {
            await hwv.model.setNodesVisibility([groundPlane], false);
        }
        else {
            await hwv.model.setNodesVisibility([groundPlane], true);
        }
    })
}

function createGroundPlane() {
    const gridSize = 300;
    const d = 0.1;
    const meshData = new Communicator.MeshData();

    meshData.setFaceWinding(Communicator.FaceWinding.Clockwise);
    meshData.setBackfacesEnabled(true);

    meshData.addFaces([
        // +Z Normal Plane
        -gridSize, -gridSize, 0,
        -gridSize, gridSize, 0,
        gridSize, gridSize, 0,
        -gridSize, -gridSize, 0,
        gridSize, gridSize, 0,
        gridSize, -gridSize, 0,

        // -Z Normal Plane
        -gridSize, -gridSize, -d,
        -gridSize, gridSize, -d,
        gridSize, gridSize, -d,
        -gridSize, -gridSize, -d,
        gridSize, gridSize, -d,
        gridSize, -gridSize, -d,

        // +X Normal Plane
        gridSize, -gridSize, 0,
        gridSize, -gridSize, -d,
        gridSize, gridSize, -d,
        gridSize, -gridSize, 0,
        gridSize, gridSize, -d,
        gridSize, gridSize, 0,

        // -X Normal Plane
        -gridSize, -gridSize, 0,
        -gridSize, -gridSize, -d,
        -gridSize, gridSize, -d,
        -gridSize, -gridSize, 0,
        -gridSize, gridSize, -d,
        -gridSize, gridSize,  0,

        // +Y Normal Plane
        -gridSize, gridSize, 0,
        gridSize, gridSize, 0,
        -gridSize, gridSize, -d,
        gridSize, gridSize, 0,
        gridSize, gridSize, -d,
        -gridSize, gridSize, -d,

        // -Y Normal Plane
        -gridSize, -gridSize, 0,
        gridSize, -gridSize, 0,
        -gridSize, -gridSize, -d,
        gridSize, -gridSize, 0,
        gridSize, -gridSize, -d,
        -gridSize, -gridSize, -d,
    ], [
        // +Z Normals
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

        // -Z Normals
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

        // +X Normals
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

        // -X Normals
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,

        // +Y Normals
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

        // -Y Normals
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

    ]);

    let gridCount = 30;
    let gridUnit = (gridSize/gridCount) * 2;
    for (let i=-gridCount/2; i<=gridCount/2; ++i) {
        let position = (gridUnit * i);
        meshData.addPolyline([
            -gridSize, position, 0,
            gridSize, position, 0
        ]);
        meshData.addPolyline([
            position, -gridSize, 0,
            position, gridSize, 0
        ]);
    }


    hwv.model.createMesh(meshData).then((meshId) => {
        let flags = Communicator.MeshInstanceCreationFlags.ExcludeBounding |
        Communicator.MeshInstanceCreationFlags.DoNotSelect |
        Communicator.MeshInstanceCreationFlags.DoNotCut |
        Communicator.MeshInstanceCreationFlags.DoNotExplode |
        Communicator.MeshInstanceCreationFlags.OverrideSceneVisibility |
        Communicator.MeshInstanceCreationFlags.DoNotLight;
        let meshInstanceData = new Communicator.MeshInstanceData(meshId, null, "printingPlane", null, null, null, flags);
        meshInstanceData.setLineColor(new Communicator.Color(220,220,220));
        meshInstanceData.setFaceColor(new Communicator.Color(170,170,170));
        meshInstanceData.setOpacity(0.5);
        //do not provide a node id since this will be out of hierarchy
        hwv.model.createMeshInstance(meshInstanceData, null, null, true).then((nodeId) => {
            groundPlane = nodeId;
            //console.log('Ground plane created: ' + nodeId);
        })
    })
}
