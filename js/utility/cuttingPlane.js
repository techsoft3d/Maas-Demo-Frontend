// Utility: Cutting Planes
/*
Global variables used:
- Communicator
- hwv
*/

function setupCutPlanes() {
    // add event listeners for cutting planes:
    const cutXBox = document.getElementById("cutX");
    const cutYBox = document.getElementById("cutY");
    const cutZBox = document.getElementById("cutZ");

    const cutXFlip = document.getElementById("cutXFlip");
    const cutYFlip = document.getElementById("cutYFlip");
    const cutZFlip = document.getElementById("cutZFlip");
    
    cutXBox.addEventListener("change", ()=>updateCuttingSection(cutXBox, Communicator.Axis.X, cutXFlip.checked));
    cutYBox.addEventListener("change", ()=>updateCuttingSection(cutYBox, Communicator.Axis.Y, cutYFlip.checked));
    cutZBox.addEventListener("change", ()=>updateCuttingSection(cutZBox, Communicator.Axis.Z, cutZFlip.checked));

    cutXFlip.addEventListener("change", ()=>flipCuttingSection(cutXBox, Communicator.Axis.X, cutXFlip.checked));
    cutYFlip.addEventListener("change", ()=>flipCuttingSection(cutYBox, Communicator.Axis.Y, cutYFlip.checked));
    cutZFlip.addEventListener("change", ()=>flipCuttingSection(cutZBox, Communicator.Axis.Z, cutZFlip.checked));   
}


function updateCuttingSection(axisId, axis, flipped) {
    if (axisId.checked) {
        addCuttingSection(axis, flipped);
    }
    else {
        removeCuttingSection(axis);
    }
}

function flipCuttingSection(axisId, axis, flipped) {
    if (!axisId.checked) return; // the cutting section is not active, do nothing
    hwv.cuttingManager.getCuttingSection(axis).clear().then(()=>{
        addCuttingSection(axis, flipped);
    });

}

function addCuttingSection(axis, flipped) {
    hwv.model.getNodeRealBounding(mainModelNode).then((boundingBox)=>{    
        const refGeom = hwv.cuttingManager.createReferenceGeometryFromAxis(axis, boundingBox);

        const cuttingSection = hwv.cuttingManager.getCuttingSection(axis);
        let normal = new Communicator.Point3();
        let d;
        let flipStatus = 1;
        if (flipped) {
            flipStatus = -1;
        }
        switch (axis) {
            case Communicator.Axis.X:
                normal.set(1*flipStatus,0,0);
                d = - (boundingBox.min.x + (boundingBox.max.x - boundingBox.min.x)/2);
                break
            case Communicator.Axis.Y:
                normal.set(0,1*flipStatus,0);
                d = - (boundingBox.min.y + (boundingBox.max.y - boundingBox.min.y)/2);
                break;
            case Communicator.Axis.Z:
                normal.set(0,0,1*flipStatus);
                d = -flipStatus * (boundingBox.min.z + (boundingBox.max.z - boundingBox.min.z)/2);
                break;
        }
        const cutPlane = Communicator.Plane.createFromCoefficients(normal.x, normal.y, normal.z, d);
        if (cuttingSection != null) {
            cuttingSection.addPlane(cutPlane, refGeom);
            cuttingSection.activate();
        }

    });
}

function removeCuttingSection(axis) {
    const cuttingSection = hwv.cuttingManager.getCuttingSection(axis);
    cuttingSection.clear();
}