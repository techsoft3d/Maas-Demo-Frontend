const driver = window.driver.js.driver;

const driverObj = driver({
    showProgress: true,
    steps: [
        { 
            element: '.body', 
            popover: { 
                title: 'Welcome!', 
                description: 'This is a minimal demo application showing how Tech Soft 3D SDKs can be used to support a "manufacturing as a service" (MaaS) workflow. It uses <b><a href="https://www.techsoft3d.com/products/hoops/exchange" target="_blank">HOOPS Exchange</a></b>, <b><a href="https://www.techsoft3d.com/products/hoops/communicator" target="_blank">HOOPS Communicator</a></b>, and <b><a href="https://www.techsoft3d.com/products/polygonica" target="_blank">Polygonica</a></b> SDKs. Click "next" to continue.' 
            },
        },
        { 
            element: '#loadButton', 
            popover: { 
                title: 'Upload model', 
                description: `To get started, select a model to upload to the server we created for this demo. On this server, the <a href="https://www.techsoft3d.com/products/hoops/exchange" target="_blank">HOOPS Exchange</a> API is used to <a href="https://docs.techsoft3d.com/exchange/latest/guide/basic_operations/load_model.html" target="_blank">read the model data</a>.` 
            },
        },
        { 
            element: '#loadButton', 
            popover: { 
                title: 'Conversion', 
                description: `The model is converted to <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/data_model/stream_cache/overview.html" target="_blank">SCS</a> format on the server, which is a format optimized for web viewing. The server responds to the client with the buffer of the SCS file.` 
            },
        },
        { 
            element: '#viewer', 
            popover: { 
                title: 'View model', 
                description: 'The 3D scene displayed here (the "web viewer") is part of the <a href="https://www.techsoft3d.com/products/hoops/communicator" target="_blank">HOOPS Communicator</a> SDK and supports standard CAD-like interactivity out of the box, like orbit, zoom, pan, and select. The SCS file is <a href="https://docs.techsoft3d.com/communicator/latest/api_ref/viewing/classes/Communicator.Model.html#loadsubtreefromscsbuffer" target="_blank">loaded into this scene</a>.' 
            },
        },
        { 
            element: '#infoDetails', 
            popover: { 
                title: 'Data extraction', 
                description: 'The HOOPS Communicator API provides functions to extract data from the CAD model like its <a href="https://docs.techsoft3d.com/communicator/latest/api_ref/viewing/classes/Communicator.Model.html" target="_blank">name, bounding box, volume, and surface area</a>.' 
            },
        },
        { 
            element: '#materialProps', 
            popover: { 
                title: 'Physically based rendering', 
                description: 'The HOOPS Communicator API also supports <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/model_attributes/materials/physically-based-rendering.html" target="_blank">physically based rendering</a>, allowing you to customize model appearance via metallic and roughness factors, image-based lighting, and more.' 
            },
        },
        { 
            element: '#measureBtn', 
            popover: { 
                title: 'Measurements', 
                description: 'Basic measurement "<a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/operators/standard-operators.html" target="_blank">operators</a>" are provided via the HOOPS Communicator API, like point to point, edge length, face to face, and more. You can also build your own <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/operators/custom-operators.html" target="_blank">custom measurement operators</a>.' 
            },
        },
        { 
            element: '#measureBtn', 
            popover: { 
                title: 'PMI', 
                description: 'Also, HOOPS Exchange is capable of reading <a href="https://forum.techsoft3d.com/t/how-to-access-pmi-gd-t-with-hoops-exchange/1497" target="_blank">PMI</a> (GD&T) embedded in the CAD model. This data can be <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/mcad/pmi.html" target="_blank">displayed and extracted</a> using HOOPS Communicator.' 
            },
        },
        { 
            element: '#groundBtn', 
            popover: { 
                title: 'Scene geometry', 
                description: `The HOOPS Communicator API allows <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/geometry/meshes.html" target="_blank">meshes to be inserted</a> into the scene, like the ground plane in this viewer.`
            },
        },
        { 
            element: '#orientBtn', 
            popover: { 
                title: 'Transformations', 
                description: `Models can be <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/model_attributes/matrices.html" target="_blank">transformed</a> in the web viewer by setting the model's transformation matrix. This button, for example, defines how the model will lay on the ground plane.`
            },
        },
        { 
            element: '#detectOverhangsBtn', 
            popover: { 
                title: 'Mesh analysis', 
                description: `The HOOPS Communicator API also provides <a href="https://docs.techsoft3d.com/communicator/latest/api_ref/viewing/classes/Communicator.Model.html?Production%5Bquery%5D=pbr#Communicator.Model.getNodeMeshData" target="_blank">access to the model's tessellation</a> so you can perform basic operations on the mesh. This button performs overhang detection by checking the angle and position of the normal vector for each vertex, then applying a color based on the values.`
            },
        },
        { 
            element: '#cutBtn', 
            popover: { 
                title: 'Cutting sections', 
                description: `Included in the HOOPS Communicator library is a <a href="https://docs.techsoft3d.com/communicator/latest/prog_guide/viewing/scene_attributes/cutting-planes.html" target="_blank">cutting operator</a> that supports cutting planes like those provided in CAD applications.`
            },
        },
        { 
            element: '#wallThicknessBtn', 
            popover: { 
                title: 'Wall thickness', 
                description: `This button performs a wall thickness analysis using the <a href="https://www.techsoft3d.com/products/polygonica" target="_blank">Polygonica</a> SDK on the server. A value representing the wall thickness is provided for each vertex and this data is sent to the web viewer for display, where the Communicator API is used to insert the mesh and apply a vertex color based on that wall thickness value.`
            },
        },
        { 
            element: '#detectFeaturesBtn', 
            popover: { 
                title: 'Feature detection', 
                description: `The Polygonica API also provides basic feature detection for machining features like holes, pockets, and more.`
            },
        },
        { 
            element: '#viewer', 
            popover: { 
                title: 'Explore!', 
                description: `This concludes the quick tour of this demo app! To start working with HOOPS SDKs, you can download the package and start a free evaluation here: <a href="https://manage.techsoft3d.com/" target="_blank">https://manage.techsoft3d.com/</a>.<br>To schedule a call or to evaluate Polygonica, please <a href="https://www.techsoft3d.com/company#contact" target="_blank">contact us</a>.`
            },
        },

    ]
  });
  

  // Button click starts tour:
  document.getElementById("tourBtn").addEventListener("click", () => driverObj.drive());
  document.getElementById("startTourBtn").addEventListener("click", () => {
    driverObj.drive();
    document.getElementById("tourPrompt").style.display = "none";
  });