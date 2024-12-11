# Manufacturing as a Service Demo

<b>Disclaimer:</b> This project was created for demonstration purposes, only. It is provided as-is, and may contain errors or bugs.

### About
The goal of this demo is to demonstrate how [HOOPS Exchange](https://docs.techsoft3d.com/exchange/latest/), [HOOPS Communicator](https://docs.techsoft3d.com/communicator/latest/), and [Polygonica](https://www.techsoft3d.com/products/polygonica) can be used in a manufacturing analysis application. Capabilities include:
- Part uploading and viewing
- Measurements
- Part property display and appearance customization
- Wall thickness analysis
- Overhang detection
- Feature (hole and pocket) detection

This project was originally created from the Tech Soft 3D [3D Printing Demo](https://labs.techsoft3d.com/project/3d-printing-demo/).

### Running the Client
Use the VS Code [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or your preferred server tool to serve `index.html`.

## How it works
1. Upload a CAD part file via the client.
2. CAD file is read via HOOPS Exchange.
3. A UUID is generated for the part.
4. A Polygonica entity is generated via the Exchange-Polygonica bridge and stored in memory with the UUID as a map.
5. An SCS file is generated using libconverter (part of HOOPS Communicator) and sent as a buffer to the client, along with the UUID.
6. The client renders the SCS file into a web viewer using HOOPS Communicator.
7. The client-side functionality is supported by the HOOPS Communicator API.
8. The WallThickness and DetectFeatures endpoints on the server require a POST request with the UUID for the model to use for analysis with the Polygonica API.
9. When a new model is uploaded during a user session or a session ends, a POST request to the CloseUuidSession endpoint with the UUID removes the Polygonica entity from the server.

#### Built using:
- HOOPS Exchange 2024.7.0
- HOOPS Communicator 2024.7.1
- Polygonica 3.3 Patch 9

### Additional resources used:
- [Poly Haven](https://polyhaven.com/) for image-based lighting image.
- [Boxicons](https://boxicons.com/) for icons.
