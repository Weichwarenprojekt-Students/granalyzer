import { RelationInfo } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationInfo";
import { dia, linkTools, shapes } from "jointjs";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { RemoveRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/RemoveRelationCommand";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";
import { RelationsMap } from "@/modules/editor/modules/graph-editor/controls/relations/RelationsMap";

/**
 * Controller for all relations in the joint js graph
 */
export default class RelationsController extends RelationsMap {
    /**
     * Constructor
     *
     * @param graphHandler Instance of the graph handler
     */
    constructor(private readonly graphHandler: GraphHandler) {
        super();
    }

    /**
     * Generator which iterates over normal relations
     */
    public *normalRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType === RelationModeType.NORMAL) yield rel;
    }

    /**
     * Generator which iterates over faint relations
     */
    public *faintRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType === RelationModeType.FAINT) yield rel;
    }

    /**
     * Generator which iterates over visual relations
     */
    public *visualRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType === RelationModeType.VISUAL) yield rel;
    }

    /**
     * Generator which iterates over normal and visual relations, because those are the only ones to be saved
     */
    public *savableRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType !== RelationModeType.FAINT) yield rel;
    }

    /**
     * Create a new relation and add it to the graph
     *
     * @param source The source node of the relation
     * @param target The target node of the relation
     * @param relationModeType The type of relation in relation mode, defaults to NORMAL
     * @param labelText An optional text for the relation
     * @param uuid An optional uuid for the relation
     */
    public new(
        source: Node,
        target: Node,
        relationModeType = RelationModeType.NORMAL,
        labelText?: string,
        uuid?: string,
    ): Relation {
        // Create new relation info
        const relationInfo: RelationInfo = {
            uuid: uuid ?? "unknown",
            from: source.reference,
            to: target.reference,
        };

        // Create the link and connect it to source and target
        const link = new shapes.standard.Link();
        link.source(source.jointElement);
        link.target(target.jointElement);
        link.attr({
            line: {
                strokeWidth: 4,
            },
        });

        // Optionally set a label
        if (labelText) {
            link.appendLabel(Relation.makeLabel(labelText, relationModeType));
            relationInfo.label = labelText;
        }

        // Create the relation and add it to the graph
        const relation = new Relation(relationInfo, link, source, target, relationModeType);
        this.addExisting(relation);

        return relation;
    }

    /**
     * Add an existing relation object to the graph
     *
     * @param relation The relation to add
     * @param relationModeType
     */
    public addExisting(relation: Relation, relationModeType?: RelationModeType): void {
        if (relationModeType != null) relation.relationModeType = relationModeType;

        // Add relation to RelationsMap and to the joint js graph
        this.add(relation);
        relation.jointLink.addTo(this.graphHandler.graph.graph);

        // Register the relation on the source and target nodes
        relation.reconnect();

        this.setLinkTools(relation);
    }

    public removeExisting(relation: Relation): void {
        this.remove(relation);
        relation.jointLink.remove();

        // Remove relation from source and target nodes
        relation.disconnect();
    }

    /**
     * Set link tools to a relation according to the type of relation
     *
     * @param relation The relation to add link tools to
     */
    public setLinkTools(relation: Relation): void {
        // Remove all existing tools
        const link = relation.jointLink;
        const linkView = link.findView(this.graphHandler.graph.paper);
        linkView.removeTools();

        let toolsView;

        // Prepare tools based on the relation mode type
        switch (relation.relationModeType) {
            case RelationModeType.VISUAL: {
                // For visual relations, source and target should be editable
                const sourceArrowTool = new linkTools.SourceArrowhead();
                const targetArrowTool = new linkTools.TargetArrowhead();

                // And the visual relation should also be able to be removed
                const removeTool = new linkTools.Remove({
                    action: async (evt, linkView) => {
                        const rel = this.graphHandler.relations.getByJointId(linkView.model.id);
                        if (rel)
                            await this.graphHandler.dispatchCommand(new RemoveRelationCommand(this.graphHandler, rel));
                    },
                });

                toolsView = new dia.ToolsView({
                    tools: [sourceArrowTool, targetArrowTool, removeTool],
                });
                break;
            }
            default: {
                // For all other relations, only vertices and segments should be editable, but they are only shown
                // outside of relation edit mode anyways
                const verticesTool = new linkTools.Vertices({ stopPropagation: false });
                const segmentsTool = new linkTools.Segments({ stopPropagation: false });

                toolsView = new dia.ToolsView({
                    tools: [verticesTool, segmentsTool],
                });
            }
        }

        // Add prepared tools to the link
        linkView.addTools(toolsView);
        linkView.hideTools();
    }

    /**
     * Switch a relation to normal relation mode type
     *
     * @param relation The relation to switch
     */
    public switchToNormal(relation: Relation): void {
        relation.relationModeType = RelationModeType.NORMAL;
        this.setLinkTools(relation);
    }

    /**
     * Switch a relation to visual relation mode type
     *
     * @param relation The relation to switch
     */
    public switchToVisual(relation: Relation): void {
        relation.relationModeType = RelationModeType.VISUAL;
        this.setLinkTools(relation);
    }

    /**
     * Switch a relation to faint relation mode type
     *
     * @param relation The relation to switch
     */
    public switchToFaint(relation: Relation): void {
        relation.relationModeType = RelationModeType.FAINT;
        this.setLinkTools(relation);
    }
}
