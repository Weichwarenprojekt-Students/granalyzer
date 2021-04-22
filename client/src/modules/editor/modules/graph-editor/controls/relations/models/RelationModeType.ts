/**
 * Enum to represent the different types of relations in relation mode
 */
export enum RelationModeType {
    /**
     * All relations are displayed as normal relations outside of relation mode. In relation mode, only DB relations
     * which are currently active in the diagram are displayed as normal relations
     */
    NORMAL,
    /**
     * DB relations which are currently not active in the diagram are displayed as faint relations in relation mode
     */
    FAINT,
    /**
     * Relations that have no counterpart in the DB are displayed as visual relation in relation edit mode
     */
    VISUAL,
}
