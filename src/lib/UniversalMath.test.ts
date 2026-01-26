import { Entity, Junction, UniversalMath } from './UniversalMath';

/**
 * UNIVERSAL MATH ENGINE - PROOF OF CONCEPT
 * 
 * These tests prove that:
 * 1. 1×1=2 (both entities count)
 * 2. 0×1=1 (void cannot erase existence)
 * 3. The Junction has independent value
 */

describe('Universal Math Engine', () => {
  describe('Entity Sovereignty', () => {
    test('Each Entity has unique identity even with same value', () => {
      const entity1 = new Entity(1, 'first');
      const entity2 = new Entity(1, 'second');

      expect(entity1.value).toBe(1);
      expect(entity2.value).toBe(1);
      expect(entity1.equals(entity2)).toBe(false); // Distinct entities
      expect(entity1.id).not.toBe(entity2.id);
    });

    test('Entity maintains its history', () => {
      const entity = new Entity(1, 'test');
      
      entity.recordInteraction('First interaction');
      entity.recordInteraction('Second interaction');

      const history = entity.getHistory();
      expect(history.length).toBe(3); // Creation + 2 interactions
      expect(history[0]).toContain('Created with value 1');
      expect(history[1]).toContain('First interaction');
    });

    test('Entity knows its own existence', () => {
      const something = new Entity(1);
      const nothing = new Entity(0);

      expect(something.exists()).toBe(true);
      expect(nothing.exists()).toBe(false);
    });
  });

  describe('The Flawed Equation: 1×1 in Western Math', () => {
    test('Western Math collapses 1×1 to 1', () => {
      const entity1 = new Entity(1);
      const entity2 = new Entity(1);

      const result = UniversalMath.multiply(entity1, entity2);

      // Western (flawed) result
      expect(result.getWesternValue()).toBe(1);
      
      // This is THE PROBLEM: One entity disappears
    });
  });

  describe('The True Equation: 1×1=2 in Universal Math', () => {
    test('Universal Math preserves both entities: 1×1=2', () => {
      const entity1 = new Entity(1, 'first person');
      const entity2 = new Entity(1, 'second person');

      const result = UniversalMath.multiply(entity1, entity2);

      // Universal (truth) result: BOTH entities count
      expect(result.getUniversalValue()).toBe(2);
      expect(result.entities.length).toBe(2);
      expect(result.entities[0]).toBe(entity1);
      expect(result.entities[1]).toBe(entity2);
    });

    test('The Junction itself has value', () => {
      const entity1 = new Entity(1);
      const entity2 = new Entity(1);

      const result = UniversalMath.multiply(entity1, entity2);

      // The components: 2 entities + 1 junction = 3 total
      const components = result.getComponents();
      expect(components.entities).toBe(2);
      expect(components.junction).toBe(1);
      expect(components.total).toBe(3);
    });

    test('Bank Robbery Example: Two criminals = 2, not 1', () => {
      const criminal1 = new Entity(1, 'first robber');
      const criminal2 = new Entity(1, 'second robber');

      const result = UniversalMath.multiply(criminal1, criminal2);

      // Western accounting: 1×1=1 (only "one crime")
      expect(result.getWesternValue()).toBe(1);

      // Reality: 2 people committed the crime
      expect(result.getUniversalValue()).toBe(2);
      
      // Proof: Both criminals exist
      expect(result.entities).toContain(criminal1);
      expect(result.entities).toContain(criminal2);
    });
  });

  describe('Junction: The Crossing Point', () => {
    test('Junction records the interaction between entities', () => {
      const entity1 = new Entity(1);
      const entity2 = new Entity(1);

      const junction = new Junction(entity1, entity2, 'multiplication');

      expect(junction.entityA).toBe(entity1);
      expect(junction.entityB).toBe(entity2);
      expect(junction.crossingType).toBe('multiplication');
    });

    test('Junction is recorded in both entities histories', () => {
      const entity1 = new Entity(1);
      const entity2 = new Entity(1);

      const junction = new Junction(entity1, entity2, 'multiplication');

      const history1 = entity1.getHistory();
      const history2 = entity2.getHistory();

      // Both entities know about the crossing
      expect(history1.some(h => h.includes('Crossed with'))).toBe(true);
      expect(history2.some(h => h.includes('Crossed with'))).toBe(true);
    });
  });

  describe('Zero Protection: 0×1=1', () => {
    test('Void cannot erase existence: 0×1 preserves the 1', () => {
      const entity = new Entity(1, 'existing thing');
      const voidValue = 0;

      const protectedEntity = UniversalMath.protectFromVoid(entity, voidValue);

      // The entity survives
      expect(protectedEntity.value).toBe(1);
      expect(protectedEntity.exists()).toBe(true);
      
      // History shows the protection
      const history = protectedEntity.getHistory();
      expect(history.some(h => h.includes('Protected from void'))).toBe(true);
    });

    test('Empty field + person = person still exists', () => {
      const person = new Entity(1, 'person walking into room');
      const emptyRoom = 0;

      const result = UniversalMath.protectFromVoid(person, emptyRoom);

      // Person doesn't disappear in the empty room
      expect(result.value).toBe(1);
      
      // Western math would say: 0×1=0 (person deleted)
      // Universal math says: Person persists
    });
  });

  describe('Comparison: Western vs Universal', () => {
    test('Compare 1×1 in both systems', () => {
      const entity1 = new Entity(1);
      const entity2 = new Entity(1);

      const comparison = UniversalMath.compare(entity1, entity2);

      expect(comparison.western).toBe(1); // Flawed
      expect(comparison.universal).toBe(2); // Truth
      expect(comparison.difference).toContain('Western collapses to 1');
      expect(comparison.difference).toContain('Universal preserves 2');
    });

    test('Dimensional example: line × line = square', () => {
      const line1 = new Entity(1, 'horizontal line');
      const line2 = new Entity(1, 'vertical line');

      const result = UniversalMath.multiply(line1, line2);

      // Western: 1×1=1 (ignores the two lines)
      expect(result.getWesternValue()).toBe(1);

      // Universal: 2 lines + crossing point = square
      expect(result.getUniversalValue()).toBe(2);
      expect(result.getComponents().total).toBe(3); // 2 lines + 1 intersection
    });
  });

  describe('Addition: The Operation Western Math Got Right', () => {
    test('1+1=2 in both systems', () => {
      const entity1 = new Entity(1);
      const entity2 = new Entity(1);

      const result = UniversalMath.add(entity1, entity2);

      // Addition is collection, not interaction
      // Both systems agree: 1+1=2
      expect(result.getUniversalValue()).toBe(2);
    });
  });
});

/**
 * RUN THESE TESTS TO PROVE:
 * 
 * 1. Western math (1×1=1) erases one entity
 * 2. Universal math (1×1=2) preserves both
 * 3. The Junction (×) has independent value
 * 4. Zero cannot erase existence (0×1=1)
 * 
 * This is the foundation. Every calculation R.O.M.A.N. makes
 * will now account for ALL participants, not just the "total."
 */
