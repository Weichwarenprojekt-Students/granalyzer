export class Diagram {
    /**
     * The actual graph data
     */
    // language=JSON
    public serialized = `
      {
        "nodes": [
          {"ref": {"uuid": "0", "index": 0}, "label": "n0", "shape": "rectangle","x": 1000, "y": -100 },
          {"ref": {"uuid": "1", "index": 0}, "label": "n1", "shape": "rectangle","x": 300, "y": -10 },
          {"ref": {"uuid": "2", "index": 0}, "label": "n2", "shape": "rectangle","x": 10, "y": 10 },
          {"ref": {"uuid": "3", "index": 0}, "label": "n3", "shape": "rectangle","x": 320, "y": -100 },
          {"ref": {"uuid": "4", "index": 0}, "label": "n4", "shape": "circle","x": 100, "y": 900 },
          {"ref": {"uuid": "5", "index": 0}, "label": "n5", "shape": "rectangle","x": 120, "y": 213 },
          {"ref": {"uuid": "6", "index": 0}, "label": "n6", "shape": "rectangle","x": 543, "y": 12 },
          {"ref": {"uuid": "7", "index": 0}, "label": "n7", "shape": "rectangle","x": 543, "y": -100 },
          {"ref": {"uuid": "8", "index": 0}, "label": "n8", "shape": "rectangle","x": 1, "y": 0 },
          {"ref": {"uuid": "9", "index": 0}, "label": "n9", "shape": "rectangle","x": 0, "y": -222 },
          {"ref": {"uuid": "10", "index": 0}, "label": "n10", "shape": "rectangle","x": 435, "y": 69 },
          {"ref": {"uuid": "11", "index": 0}, "label": "n11", "shape": "rectangle","x": 23, "y": 10 },
          {"ref": {"uuid": "12", "index": 0}, "label": "n12", "shape": "rectangle","x": -129, "y": 39 },
          {"ref": {"uuid": "13", "index": 0}, "label": "n13", "shape": "rectangle","x": 234, "y": 843 },
          {"ref": {"uuid": "14", "index": 0}, "label": "n14", "shape": "rectangle","x": -301, "y": 129 },
          {"ref": {"uuid": "15", "index": 0}, "label": "n15", "shape": "rectangle","x": -20, "y": -76 },
          {"ref": {"uuid": "16", "index": 0}, "label": "n16", "shape": "rectangle","x": 1220, "y": -34 },
          {"ref": {"uuid": "17", "index": 0}, "label": "n17", "shape": "rectangle","x": -10, "y": 954 },
          {"ref": {"uuid": "18", "index": 0}, "label": "n18", "shape": "rectangle","x": 492, "y": 123 },
          {"ref": {"uuid": "19", "index": 0}, "label": "n19", "shape": "rectangle","x": 123, "y": -241 }
        ],
        "relations": [
          {"from": {"uuid": "0", "index": 0}, "to": {"uuid": "16", "index": 0}, "type": "e0-16"},
          {"from": {"uuid": "2", "index": 0}, "to": {"uuid": "3", "index": 0}, "type": "e2-3"},
          {"from": {"uuid": "4", "index": 0}, "to": {"uuid": "5", "index": 0}, "type": "e4-5"},
          {"from": {"uuid": "4", "index": 0}, "to": {"uuid": "6", "index": 0}, "type": "e4-6"},
          {"from": {"uuid": "5", "index": 0}, "to": {"uuid": "6", "index": 0}, "type": "e5-6"},
          {"from": {"uuid": "7", "index": 0}, "to": {"uuid": "13", "index": 0}, "type": "e7-13"},
          {"from": {"uuid": "8", "index": 0}, "to": {"uuid": "14", "index": 0}, "type": "e8-14"},
          {"from": {"uuid": "9", "index": 0}, "to": {"uuid": "10", "index": 0}, "type": "e9-10"},
          {"from": {"uuid": "10", "index": 0}, "to": {"uuid": "14", "index": 0}, "type": "e10-14"},
          {"from": {"uuid": "10", "index": 0}, "to": {"uuid": "12", "index": 0}, "type": "e10-12"},
          {"from": {"uuid": "11", "index": 0}, "to": {"uuid": "14", "index": 0}, "type": "e11-14"},
          {"from": {"uuid": "12", "index": 0}, "to": {"uuid": "13", "index": 0}, "type": "e12-13"},
          {"from": {"uuid": "16", "index": 0}, "to": {"uuid": "17", "index": 0}, "type": "e16-17"},
          {"from": {"uuid": "16", "index": 0}, "to": {"uuid": "18", "index": 0}, "type": "e16-18"},
          {"from": {"uuid": "17", "index": 0}, "to": {"uuid": "18", "index": 0}, "type": "e17-18"},
          {"from": {"uuid": "18", "index": 0}, "to": {"uuid": "19", "index": 0}, "type": "e18-19"}
        ]
      }`;

    /**
     * GraphData Model
     *
     * @param name Name of the specific diagram
     * @param id Identifier
     */
    constructor(public name: string, public id: number = 0) {}

    /**
     * Copy a diagram
     */
    public static copy(diagram: Diagram): Diagram {
        return new Diagram(diagram.name, diagram.id);
    }
}
