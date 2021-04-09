export class Diagram {
    /**
     * Mock graph
     */
    // language=JSON
    public serialized = `{
      "nodes":[
        {"label":"A League of Their Own","ref":{"index":0,"uuid":160},"color":"#753780","shape":"rectangle","x":-239,"y":4},
        {"label":"Bill Paxton","ref":{"index":0,"uuid":144},"color":"#55a962","shape":"rectangle","x":-245,"y":187},
        {"label":"The Matrix","ref":{"index":0,"uuid":0},"color":"#753780","shape":"rectangle","x":331.6666564941406,"y":-119.99999237060547},
        {"label":"The Matrix Reloaded","ref":{"index":0,"uuid":9},"color":"#753780","shape":"rectangle","x":491,"y":-123},
        {"label":"The Matrix Revolutions","ref":{"index":0,"uuid":10},"color":"#753780","shape":"rectangle","x":692,"y":-119},
        {"label":"Carrie-Anne Moss","ref":{"index":0,"uuid":2},"color":"#55a962","shape":"rectangle","x":499,"y":284},
        {"label":"Emil Eifrem","ref":{"index":0,"uuid":8},"color":"#55a962","shape":"rectangle","x":131,"y":301},
        {"label":"Joel Silver","ref":{"index":0,"uuid":7},"color":"#55a962","shape":"rectangle","x":940,"y":-436},
        {"label":"Lana Wachowski","ref":{"index":0,"uuid":6},"color":"#55a962","shape":"rectangle","x":899,"y":429},
        {"label":"Hugo Weaving","ref":{"index":0,"uuid":4},"color":"#55a962","shape":"rectangle","x":295,"y":-576},
        {"label":"Cloud Atlas","ref":{"index":0,"uuid":105},"color":"#753780","shape":"rectangle","x":-133,"y":427},
        {"label":"Jessica Thompson","ref":{"index":0,"uuid":167},"color":"#55a962","shape":"rectangle","x":-133,"y":724},
        {"label":"James Thompson","ref":{"index":0,"uuid":168},"color":"#55a962","shape":"rectangle","x":246,"y":725},
        {"label":"The Da Vinci Code","ref":{"index":0,"uuid":109},"color":"#753780","shape":"rectangle","x":63,"y":565},
        {"label":"The Birdcage","ref":{"index":0,"uuid":95},"color":"#753780","shape":"rectangle","x":-135,"y":927},
        {"label":"That Thing You Do","ref":{"index":0,"uuid":85},"color":"#753780","shape":"rectangle","x":-193.9632110595703,"y":-482.7667236328125},
        {"label":"Tom Hanks","ref":{"index":0,"uuid":71},"color":"#55a962","shape":"rectangle","x":-646,"y":576},
        {"label":"Something's Gotta Give","ref":{"index":0,"uuid":152},"color":"#753780","shape":"rectangle","x":647,"y":889},
        {"label":"Nancy Meyers","ref":{"index":0,"uuid":154},"color":"#55a962","shape":"rectangle","x":647,"y":698}
      ],
      "relations":[
        {"uuid":237,"type":"ACTED_IN","from":{"uuid":144,"index":0},"to":{"uuid":160,"index":0}},
        {"uuid":16,"type":"ACTED_IN","from":{"uuid":2,"index":0},"to":{"uuid":10,"index":0}},
        {"uuid":9,"type":"ACTED_IN","from":{"uuid":2,"index":0},"to":{"uuid":9,"index":0}},
        {"uuid":1,"type":"ACTED_IN","from":{"uuid":2,"index":0},"to":{"uuid":0,"index":0}},
        {"uuid":7,"type":"ACTED_IN","from":{"uuid":8,"index":0},"to":{"uuid":0,"index":0}},
        {"uuid":21,"type":"PRODUCED","from":{"uuid":7,"index":0},"to":{"uuid":10,"index":0}},
        {"uuid":14,"type":"PRODUCED","from":{"uuid":7,"index":0},"to":{"uuid":9,"index":0}},
        {"uuid":6,"type":"PRODUCED","from":{"uuid":7,"index":0},"to":{"uuid":0,"index":0}},
        {"uuid":20,"type":"DIRECTED","from":{"uuid":6,"index":0},"to":{"uuid":10,"index":0}},
        {"uuid":13,"type":"DIRECTED","from":{"uuid":6,"index":0},"to":{"uuid":9,"index":0}},
        {"uuid":5,"type":"DIRECTED","from":{"uuid":6,"index":0},"to":{"uuid":0,"index":0}},
        {"uuid":18,"type":"ACTED_IN","from":{"uuid":4,"index":0},"to":{"uuid":10,"index":0}},
        {"uuid":11,"type":"ACTED_IN","from":{"uuid":4,"index":0},"to":{"uuid":9,"index":0}},
        {"uuid":3,"type":"ACTED_IN","from":{"uuid":4,"index":0},"to":{"uuid":0,"index":0}},
        {"uuid":143,"type":"DIRECTED","from":{"uuid":6,"index":0},"to":{"uuid":105,"index":0}},
        {"uuid":138,"type":"ACTED_IN","from":{"uuid":4,"index":0},"to":{"uuid":105,"index":0}},
        {"uuid":242,"type":"REVIEWED","from":{"uuid":167,"index":0},"to":{"uuid":105,"index":0}},
        {"uuid":239,"type":"FOLLOWS","from":{"uuid":168,"index":0},"to":{"uuid":167,"index":0}},
        {"uuid":249,"type":"REVIEWED","from":{"uuid":168,"index":0},"to":{"uuid":109,"index":0}},
        {"uuid":248,"type":"REVIEWED","from":{"uuid":167,"index":0},"to":{"uuid":109,"index":0}},
        {"uuid":247,"type":"REVIEWED","from":{"uuid":167,"index":0},"to":{"uuid":95,"index":0}},
        {"uuid":110,"type":"ACTED_IN","from":{"uuid":71,"index":0},"to":{"uuid":85,"index":0}},
        {"uuid":137,"type":"ACTED_IN","from":{"uuid":71,"index":0},"to":{"uuid":105,"index":0}},
        {"uuid":144,"type":"ACTED_IN","from":{"uuid":71,"index":0},"to":{"uuid":109,"index":0}},
        {"uuid":232,"type":"ACTED_IN","from":{"uuid":71,"index":0},"to":{"uuid":160,"index":0}},
        {"uuid":113,"type":"DIRECTED","from":{"uuid":71,"index":0},"to":{"uuid":85,"index":0}},
        {"uuid":221,"type":"PRODUCED","from":{"uuid":154,"index":0},"to":{"uuid":152,"index":0}},
        {"uuid":222,"type":"WROTE","from":{"uuid":154,"index":0},"to":{"uuid":152,"index":0}},
        {"uuid":220,"type":"DIRECTED","from":{"uuid":154,"index":0},"to":{"uuid":152,"index":0}}
      ]
    }`;

    /**
     * GraphData Model
     *
     * @param name Name of the specific diagram
     * @param diagramId Identifier
     */
    constructor(public name: string, public diagramId: string = "") {}

    /**
     * Copy a diagram
     */
    public static copy(diagram: Diagram): Diagram {
        return new Diagram(diagram.name, diagram.diagramId);
    }
}
