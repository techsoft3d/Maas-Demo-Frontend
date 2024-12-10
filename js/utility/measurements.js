// Utility: Measure Tools
/*
Global variables used:
- Communicator
- hwv
- pmiIds
*/
let currentlyActiveMeasureOp = null;

const measurePtPtOp = Communicator.OperatorId.MeasurePointPointDistance;
const measureEdgeLengthOp = Communicator.OperatorId.MeasureEdgeLength;
const measureFaceFaceAngleOp = Communicator.OperatorId.MeasureFaceFaceAngle;
const measureFaceFaceOp = Communicator.OperatorId.MeasureFaceFaceDistance;

function setupMeasureOperators() {
    // When the specific measure op button is clicked, make it the currently active operator
    const measurePtPt = document.getElementById("measurePtPt");
    const measureAngle = document.getElementById("measureAngle");
    const measureFaceDistance = document.getElementById("measureFaceDistance");
    const measureEdge = document.getElementById("measureEdge");
    const measureRadius = document.getElementById("measureRadius");

    // Register custom operator:
    const measureRadiusOp = new measureRadiusOperator(hwv)
    const measureRadiusOpId = hwv.operatorManager.registerCustomOperator(measureRadiusOp);

    const measureOperatorMap = new Map([
        [measurePtPt.id, measurePtPtOp],
        [measureAngle.id, measureFaceFaceAngleOp],
        [measureFaceDistance.id, measureFaceFaceOp],
        [measureEdge.id, measureEdgeLengthOp],
        [measureRadius.id, measureRadiusOpId]
    ]);

    measurePtPt.addEventListener("click", (e) => {
        setActiveMeasurement(measureOperatorMap, e.target);
    });
    measureAngle.addEventListener("click", (e) => {
        setActiveMeasurement(measureOperatorMap, e.target);
    });
    measureFaceDistance.addEventListener("click", (e) => {
        setActiveMeasurement(measureOperatorMap, e.target);
    });
    measureEdge.addEventListener("click", (e) => {
        setActiveMeasurement(measureOperatorMap, e.target);
    });
    measureRadius.addEventListener("click", (e) => {
        setActiveMeasurement(measureOperatorMap, e.target);
    });

    document.getElementById("clearMeasurements").addEventListener("click", ()=>{
        setActiveMeasurement(measureOperatorMap,null);
        hwv.measureManager.removeAllMeasurements();
        // Clear the custom op data:
        const radiusMeasurements = measureRadiusOp.markupItems;
        for (let i=0; i<radiusMeasurements.length; i++) {
            hwv.markupManager.removeMarkupElement(radiusMeasurements[i], hwv.view);
            hwv.markupManager.unregisterMarkup(radiusMeasurements[i], hwv.view);
        }
    });

    document.getElementById("togglePmi").addEventListener("click", ()=>{
        togglePmi();
    });
}

function setActiveMeasurement(measureOperatorMap, ele=null) {
    if (currentlyActiveMeasureOp !== null) {
        hwv.operatorManager.remove(measureOperatorMap.get(currentlyActiveMeasureOp));
        document.getElementById(currentlyActiveMeasureOp).style.fontWeight = "normal";
    }
    if (ele == null || ele.id == currentlyActiveMeasureOp) {
        // turn off measurements
        if (currentlyActiveMeasureOp !== null) {
            hwv.operatorManager.push(Communicator.OperatorId.Select);
            currentlyActiveMeasureOp = null;
        }        
    }
    else {
        if (currentlyActiveMeasureOp === null) {
            hwv.operatorManager.remove(Communicator.OperatorId.Select);
        }
        hwv.operatorManager.push(measureOperatorMap.get(ele.id));
        currentlyActiveMeasureOp = ele.id;
        ele.style.fontWeight = "bold";
    }
}

let pmiVisible = false;
async function togglePmi() {
    if (!pmiVisible) {
        await hwv.model.setNodesVisibility(pmiIds, true);
        pmiVisible = true;
    }
    else {
        await hwv.model.setNodesVisibility(pmiIds, false);
        pmiVisible = false;
    }
}