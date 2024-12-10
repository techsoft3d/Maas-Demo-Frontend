// UI interactivity (uses hwv global object)

let activeButton = null; // Track which buttons are active
let activeModal = null; // Track if modal is open

const activeBtnColor = "rgba(150,255,200,0.9)";
const inactiveBtnColor = "rgba(255,255,255,0.9)";

function resetModals(activeButton, activeModal) {
    activeButton.style.backgroundColor = inactiveBtnColor;
    activeModal.style.display = "none";
    // Clear the measurements each time:
    document.getElementById("clearMeasurements").click();
}

let infoPanelPinned = true;


const infoPanelDiv = document.getElementById("infoPanel");
const pinInfoPanel = document.getElementById("pinInfoPanel");

const materialProperties = { // density in g/mm3
    "a6061": {
        density: 2.7/1000,
        metallic: 1,
        roughness: 0.3,
        color: new Communicator.Color(255,255,255),
        customColor: false
    },
    "a5052": {
        density: 2.68/1000,
        metallic: 1,
        roughness: 0.3,
        color: new Communicator.Color(255,255,255),
        customColor: false
    },
    "ss316": {
        density:8/1000,
        metallic: 1,
        roughness: 0.1,
        color: new Communicator.Color(255,255,255),
        customColor: false
    },
    "s1018": {
        density: 7.87/1000,
        metallic: 1,
        roughness: 0.1,
        color: new Communicator.Color(200,200,200),
        customColor: false
    },
    "delrin": {
        density: 1.41/1000,
        metallic: 0,
        roughness: 0.3,
        color: new Communicator.Color(255,255,255),
        customColor: true
    },
    "hdpe": {
        density: 0.96/1000,
        metallic: 0,
        roughness: 0.5,
        color: new Communicator.Color(255,255,255),
        customColor: true
    },
    "abs": {
        density: 1/1000,
        metallic: 0,
        roughness: 0.7,
        color: new Communicator.Color(0,0,0),
        customColor: true
    }
}


pinInfoPanel.addEventListener("click", ()=>{
    if (!infoPanelPinned) {
        infoPanelDiv.classList.remove("flexible");
        pinInfoPanel.innerHTML = `<box-icon name='pin' type='solid' ></box-icon>`;
        infoPanelPinned = true;
    }
    else {
        infoPanelDiv.classList.add("flexible");
        pinInfoPanel.innerHTML = `<box-icon name='pin' ></box-icon>`;
        infoPanelPinned = false;
    }
    
});

let infoPanelOpen = false;
document.getElementById("infoPanelTab").addEventListener("click", ()=> {
    // For small screens and mobile, make the panel slide on click:
    if (window.screen.width < 600 && !infoPanelOpen) {
        infoPanelDiv.style.transform =  "translate(-100%, 0%)";
        infoPanelOpen = true;
    }
    else if (window.screen.width < 600 && infoPanelOpen) {
        infoPanelDiv.style.transform = "unset";
        infoPanelOpen = false;
    }
});

setTimeout(()=>{
    //infoPanelDiv.classList.add("flexible");
    if (window.screen.width >= 600) {
        infoPanelDiv.style.right = "0px";
        infoPanelOpen = false;
    }
   
}, 250);
setTimeout(()=>{
    if (window.screen.width >= 600) {
        pinInfoPanel.innerHTML = `<box-icon name='pin' type='solid' ></box-icon>`;
    }
}, 1250);


const colorSelect = document.getElementById("colorSelect");
colorSelect.addEventListener("input", (e)=>{
    const rgbColor = hexToRgb(e.target.value);
    hwv.model.setNodesFaceColor([hwv.model.getAbsoluteRootNode()], new Communicator.Color(rgbColor.rgbR, rgbColor.rgbG, rgbColor.rgbB));
    
    
});

const materialSelect = document.getElementById("materialSelect");
materialSelect.addEventListener("change", (e)=>{
    let volume = document.getElementById("modelVolume").innerHTML.split(/[a-z]/i)[0];
    updateVolume(volume);

    // Update the appearance
    const material = e.target.value;
    hwv.model.setMetallicRoughness([mainModelNode], 
    materialProperties[material]["metallic"],
    materialProperties[material]["roughness"]);
    if (!materialProperties[material]["customColor"]) {
        hwv.model.setNodesFaceColor([mainModelNode], materialProperties[material]["color"]);
        colorSelect.disabled = true;
    }
    else {
        const rgbColor = hexToRgb(colorSelect.value);
        hwv.model.setNodesFaceColor([mainModelNode], new Communicator.Color(rgbColor.rgbR, rgbColor.rgbG, rgbColor.rgbB));
        colorSelect.disabled = false;
    }
    hwv.view.setDrawMode(Communicator.DrawMode.Shaded);

});



function updateVolume(volume) {
    const selectedMaterial = document.getElementById("materialSelect").value;
    const density = materialProperties[selectedMaterial]["density"];
    document.getElementById("assignMaterialPrompt").style.display = "none";
    document.getElementById("modelMass").innerHTML = Math.round(density*volume*100)/100 + " g";

}


const measureModal = document.getElementById("measureModal");
const measureBtn = document.getElementById("measureBtn");
measureBtn.addEventListener("click", toggleMeasureModal);
function toggleMeasureModal() {
    
    if (measureModal.style.display !== "none" && measureModal.style.display !== "") {
        measureModal.style.display = "none";

        measureBtn.style.backgroundColor = inactiveBtnColor;
        activeButton = null;
        activeModal = null;

        // Clear the measurements:
        document.getElementById("clearMeasurements").click();
    }    
    else {
        measureModal.style.display = "block";

        measureBtn.style.backgroundColor = activeBtnColor;
        if (activeButton != null) {
            resetModals(activeButton, activeModal);
        }
        activeButton = measureBtn;
        activeModal = measureModal;
    }
}


const orientModal = document.getElementById("orientModal");
const orientBtn = document.getElementById("orientBtn");
orientBtn.addEventListener("click", ()=>{
    if (orientModal.style.display !== "none" && orientModal.style.display !== "") {
        orientModal.style.display = "none";

        orientBtn.style.backgroundColor = inactiveBtnColor;
        activeButton = null;
        activeModal = null;
    }    
    else {
        orientModal.style.display = "block";

        orientBtn.style.backgroundColor = activeBtnColor;
        if (activeButton != null) {
            resetModals(activeButton, activeModal);
        }
        activeButton = orientBtn;
        activeModal = orientModal;
    }
});


const cutModal = document.getElementById("cutModal");
const cutBtn = document.getElementById("cutBtn");
cutBtn.addEventListener("click", ()=>{
    if (cutModal.style.display !== "none" && cutModal.style.display !== "") {
        cutModal.style.display = "none";
 
        cutBtn.style.backgroundColor = inactiveBtnColor;
        activeButton = null;
        activeModal = null;
    }
    else {
        cutModal.style.display = "block";

        cutBtn.style.backgroundColor = activeBtnColor;
        if (activeButton != null) {
            resetModals(activeButton, activeModal);
        }
        activeButton = cutBtn;
        activeModal = cutModal;
    }
});


function hexToRgb(hexColor) {
    const rgbColor = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    const rgbR = parseInt(rgbColor[1], 16);
    const rgbG = parseInt(rgbColor[2], 16);
    const rgbB = parseInt(rgbColor[3], 16);
    return {
            rgbR: rgbR,
            rgbG: rgbG,
            rgbB: rgbB
    }
}


function closeIntroWindow() {
    document.getElementById("introModal").style.display = "none";
}

document.getElementById("closeIntroBtn").addEventListener("click", ()=>{
    closeIntroWindow();
})

document.getElementById("closeTourBtn").addEventListener("click", ()=>{
    document.getElementById("tourPrompt").style.display = "none";
})