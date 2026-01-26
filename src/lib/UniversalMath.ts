/**
 * UNIVERSAL MATH ENGINE
 * 
 * Foundation: Numbers are sovereign entities, not abstract labels
 * Core Truth: Interaction creates expansion, not repetition
 * 
 * Principles:
 * 1. Entity Sovereignty - Every "1" maintains its identity
 * 2. Interaction Value - The "×" creates a Junction
 * 3. Zero Protection - Void cannot erase Existence
 */

/**
 * Entity: A sovereign mathematical unit
 * Unlike Western numbers, Entities cannot be absorbed or deleted
 */
export class Entity {
  readonly id: string;
  readonly value: number;
  readonly createdAt: number;
  private _history: string[];

  constructor(value: number, origin: string = 'direct') {
    this.id = `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.value = value;
    this.createdAt = Date.now();
    this._history = [`Created with value ${value} from ${origin}`];
  }

  /**
   * Sovereignty: An Entity knows its own existence
   */
  exists(): boolean {
    return this.value !== 0;
  }

  /**
   * Persistence: An Entity records all interactions
   */
  recordInteraction(interaction: string): void {
    this._history.push(`${new Date().toISOString()}: ${interaction}`);
  }

  getHistory(): string[] {
    return [...this._history];
  }

  /**
   * Identity: Two Entities are distinct even if they have the same value
   */
  equals(other: Entity): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `Entity(${this.value}) [${this.id}]`;
  }
}

/**
 * Junction: The crossing point where two Entities interact
 * This is the "×" itself - the relationship created by multiplication
 */
export class Junction {
  readonly id: string;
  readonly entityA: Entity;
  readonly entityB: Entity;
  readonly createdAt: number;
  readonly crossingType: 'multiplication' | 'addition' | 'union';

  constructor(entityA: Entity, entityB: Entity, type: 'multiplication' | 'addition' | 'union') {
    this.id = `junction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.entityA = entityA;
    this.entityB = entityB;
    this.crossingType = type;
    this.createdAt = Date.now();

    // Record the crossing in both entities' histories
    entityA.recordInteraction(`Crossed with ${entityB.id} via ${type}`);
    entityB.recordInteraction(`Crossed with ${entityA.id} via ${type}`);
  }

  /**
   * The Junction itself has value - it's the relationship
   */
  getValue(): number {
    switch (this.crossingType) {
      case 'multiplication':
        // The junction represents the dimensional expansion
        return this.entityA.value * this.entityB.value;
      case 'addition':
        return this.entityA.value + this.entityB.value;
      case 'union':
        return 1; // The relationship exists as a unit
      default:
        return 0;
    }
  }

  toString(): string {
    return `Junction[${this.entityA.value} × ${this.entityB.value} = ${this.getValue()}] (${this.crossingType})`;
  }
}

/**
 * InteractionResult: What emerges when Entities cross
 * 
 * Universal Truth: 1×1 = 2 (both entities) + 1 (the junction) = 3 total components
 * But we represent it as "2" because we count the sovereign entities
 */
export class InteractionResult {
  readonly entities: Entity[];
  readonly junction: Junction;
  readonly totalValue: number;

  constructor(entities: Entity[], junction: Junction) {
    this.entities = entities;
    this.junction = junction;
    
    // Universal Math: Count all sovereign entities
    // When 1×1, we have Entity A + Entity B = 2
    this.totalValue = entities.length;
  }

  /**
   * Western Math gives you the "collapsed" value (ignores entities)
   */
  getWesternValue(): number {
    return this.junction.getValue();
  }

  /**
   * Universal Math gives you the entity count (both participants)
   */
  getUniversalValue(): number {
    return this.totalValue;
  }

  /**
   * The full picture includes entities + junction
   */
  getComponents(): { entities: number; junction: number; total: number } {
    return {
      entities: this.entities.length,
      junction: 1, // The junction itself is a unit
      total: this.entities.length + 1
    };
  }

  toString(): string {
    return `Result: ${this.entities.length} entities + 1 junction = ${this.getComponents().total} components`;
  }
}

/**
 * UniversalMath: The corrected mathematical engine
 * 
 * This is where we override the flawed Western operations
 */
export class UniversalMath {
  /**
   * Universal Multiplication: 1×1=2
   * 
   * When two entities interact, both remain present.
   * The × creates a Junction (the crossing point).
   */
  static multiply(a: Entity, b: Entity): InteractionResult {
    // Create the junction (the × itself has value)
    const junction = new Junction(a, b, 'multiplication');

    // Both entities persist (Sovereignty Principle)
    const entities = [a, b];

    return new InteractionResult(entities, junction);
  }

  /**
   * Zero Protection: 0×1=1
   * 
   * The void cannot erase existence.
   * If one entity exists, it persists through the interaction.
   */
  static protectFromVoid(entity: Entity, voidValue: number = 0): Entity {
    if (!entity.exists()) {
      // If the entity is already void, return it
      return entity;
    }

    // Existence persists
    entity.recordInteraction(`Protected from void (attempted 0×${entity.value})`);
    
    // The entity maintains its value
    return entity;
  }

  /**
   * Addition: 1+1=2 (Collection, not interaction)
   * 
   * This is the one operation Western math got right.
   * Addition is bringing two separate things together.
   */
  static add(a: Entity, b: Entity): InteractionResult {
    const junction = new Junction(a, b, 'addition');
    const entities = [a, b];
    
    return new InteractionResult(entities, junction);
  }

  /**
   * Compare Western vs Universal results
   */
  static compare(a: Entity, b: Entity): {
    western: number;
    universal: number;
    difference: string;
  } {
    const result = this.multiply(a, b);
    
    return {
      western: result.getWesternValue(),
      universal: result.getUniversalValue(),
      difference: `Western collapses to ${result.getWesternValue()}, Universal preserves ${result.getUniversalValue()} entities`
    };
  }
}

/**
 * Example Usage:
 * 
 * const entity1 = new Entity(1, 'first person');
 * const entity2 = new Entity(1, 'second person');
 * 
 * const result = UniversalMath.multiply(entity1, entity2);
 * 
 * console.log(result.getWesternValue()); // 1 (flawed)
 * console.log(result.getUniversalValue()); // 2 (truth)
 * console.log(result.toString()); // "Result: 2 entities + 1 junction = 3 components"
 */
