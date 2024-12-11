
class measureRadiusOperator {
    
    constructor(hwv) {
        this._hwv = hwv;
        this._radius = null;
        this._activeMarkup = null;
        this._mouseDown = false;
        this.markupItems = [];
    }
    onMouseDown(e) {
        this._mouseDown = true;
        if (e.getButton() !== Communicator.Button.Left) return;
        // Initialize operator OR place measurement if active
        if (this._activeMarkup === null) {
            
            // Get the current face or edge and check if it's radial:
            const config = new Communicator.PickConfig(Communicator.SelectionMask.Face | Communicator.SelectionMask.Line);
            this._hwv.selectionManager.clear();
    
            this._hwv.view.pickFromPoint(e.getPosition(), config).then(async (selectionItem) => {
                const nodeId = selectionItem.getNodeId()
                if (nodeId !== null) {
                    const selType = selectionItem.getSelectionType();
                    let subentityId;
                    let subentityProps;
                    switch (selType) {
                        case Communicator.SelectionType.Face:
                            subentityId = selectionItem.getFaceEntity().getCadFaceIndex();
                            subentityProps = await this._hwv.model.getFaceProperty(nodeId, subentityId);
                            
                            break;
                        case Communicator.SelectionType.Line:
                            subentityId = selectionItem.getLineEntity().getLineId();
                            subentityProps = await this._hwv.model.getEdgeProperty(nodeId, subentityId);
                            
                            break;
                        default:
                            return;
                    }
                    
                    if (!subentityProps.hasOwnProperty("radius")) return;
                    
                    this._radius = Math.round(subentityProps.radius*100)/100;
    
                    const markupManager = this._hwv.markupManager;
    
                    const position = selectionItem.getPosition();

                   
            
                    this._activeMarkup = new radiusMarkup(this._hwv, position, this._radius, this._hwv.model.getNodeUnitMultiplier(nodeId));
         
                    const markupId = markupManager.registerMarkup(this._activeMarkup, this._hwv.view);
                    this.markupItems.push(markupId);
                
                }
                
            });
        }
        else {
            // a measurement is currently active, so place the measurement
            // create a plane normal to the camera view and intersecting with point1:
            const finalPoint = this.getCurrentEndpoint(e);

            this._activeMarkup.point2 = finalPoint;
            this._activeMarkup.finalize(e);
            this._activeMarkup = null;
        }
    }
    
    onMouseMove(e) {
        //this._hwv.model.resetNodesColor();
        this._hwv.model.resetModelHighlight();
        if (this._activeMarkup !== null) {
            const currentPt = this.getCurrentEndpoint(e);
            this._activeMarkup.point2 = currentPt;
            this._hwv.markupManager.refreshMarkup(this._hwv.view);
        }
        else {
            if (this._mouseDown) return;
            // Check if radius and highlight if so
            const config = new Communicator.PickConfig(Communicator.SelectionMask.Face | Communicator.SelectionMask.Line);
            this._hwv.selectionManager.clear();
            this._hwv.view.pickFromPoint(e.getPosition(), config).then(async (selectionItem) => {
                const nodeId = selectionItem.getNodeId()
                if (nodeId !== null) {
                    const selType = selectionItem.getSelectionType();
                    let subentityId;
                    let subentityProps;
                    switch (selType) {
                        case Communicator.SelectionType.Face:
                            subentityId = selectionItem.getFaceEntity().getCadFaceIndex();
                            subentityProps = await hwv.model.getFaceProperty(nodeId, subentityId);
                            if (!subentityProps.hasOwnProperty("radius")) return;
                            // Change the face color:
                            //this._hwv.model.setNodeFaceColor(nodeId, subentityId, Communicator.Color.red());
                            this._hwv.model.setNodeFaceHighlighted(nodeId, subentityId, true)
                            break;
                        case Communicator.SelectionType.Line:
                            subentityId = selectionItem.getLineEntity().getLineId();
                            subentityProps = await hwv.model.getEdgeProperty(nodeId, subentityId);
                            if (!subentityProps.hasOwnProperty("radius")) return;
                            // Change the line color:
                            //this._hwv.model.setNodeLineColor(nodeId, subentityId, Communicator.Color.red());
                            this._hwv.model.setNodeLineHighlighted(nodeId, subentityId, true);
                            break;
                        default:
                            return;
                    }
                }
            });
        }
        
    }

    onMouseUp(e) {
        this._mouseDown = false;
    }
    

    getCurrentEndpoint(e) {
        const camPos = this._hwv.view.getCamera().getPosition();
        const camTarget = this._hwv.view.getCamera().getTarget();

        const normal = new Communicator.Point3(camTarget.x-camPos.x, camTarget.y-camPos.y, camTarget.z - camPos.z);

        const refPlane = new Communicator.Plane();
        refPlane.setFromPointAndNormal(this._activeMarkup.point1, normal);
        const ray = this._hwv.view.raycastFromPoint(e.getPosition());

        return refPlane.rayIntersection(ray);
        
    }
}

class radiusMarkup extends Communicator.Markup.MarkupItem {
    constructor(hwv, point, radius, unit) {
        super();
        this._hwv = hwv;
        this.point1 = point;
        this.point2 = null;
        this._isFinalized = false;
        this.radius = radius;
        this._unit = unit;
       
    }

    draw() {
        const view = this._hwv.view;
        if (this.point1 !== null) {
            if (this.point2 !== null) {
                const line = new Communicator.Markup.Shapes.Line();
                const point3d1 = view.projectPoint(this.point1);
                const point3d2 = view.projectPoint(this.point2);
                line.setP1(point3d1);
                line.setStartEndcapType(Communicator.Markup.Shapes.EndcapType.Arrowhead);
                line.setP2(point3d2);
                this._hwv.markupManager.getRenderer().drawLine(line);

                const text = new Communicator.Markup.Shapes.TextBox();
                text.setPosition(point3d2);
                text.setTextString(`R${this.radius * this._unit}mm`);
                text.getBoxPortion().setFillColor(Communicator.Color.white());
                text.getBoxPortion().setFillOpacity(1);
                // text.getBoxPortion().setStrokeColor(Communicator.Color.black());
                this._hwv.markupManager.getRenderer().drawTextBox(text);
            }
        }
    }
    finalize() {
        this._isFinalized = true;
        this._hwv.markupManager.refreshMarkup(this._hwv.view);
    }
}