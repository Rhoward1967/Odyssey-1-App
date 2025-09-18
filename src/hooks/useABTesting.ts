import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ABTest {
  id: string;
  name: string;
  status: string;
  variants: ABTestVariant[];
}

interface ABTestVariant {
  id: string;
  variant_name: string;
  content: any;
  is_control: boolean;
}

export function useABTesting() {
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchActiveTests();
    getSessionId();
  }, []);

  const fetchActiveTests = async () => {
    const { data: tests } = await supabase
      .from('ab_tests')
      .select(`
        *,
        variants:ab_test_variants(*)
      `)
      .eq('status', 'active');

    if (tests) {
      setActiveTests(tests);
      assignUserToTests(tests);
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const assignUserToTests = async (tests: ABTest[]) => {
    const sessionId = getSessionId();
    const newAssignments: Record<string, string> = {};

    for (const test of tests) {
      const { data: existing } = await supabase
        .from('ab_test_assignments')
        .select('variant_id')
        .eq('test_id', test.id)
        .eq('session_id', sessionId)
        .single();

      if (existing) {
        newAssignments[test.id] = existing.variant_id;
      } else {
        // Randomly assign variant
        const randomVariant = test.variants[Math.floor(Math.random() * test.variants.length)];
        
        await supabase
          .from('ab_test_assignments')
          .insert({
            test_id: test.id,
            session_id: sessionId,
            variant_id: randomVariant.id
          });

        newAssignments[test.id] = randomVariant.id;
      }
    }

    setAssignments(newAssignments);
  };

  const getVariantContent = (testName: string) => {
    const test = activeTests.find(t => t.name === testName);
    if (!test) return null;

    const variantId = assignments[test.id];
    const variant = test.variants.find(v => v.id === variantId);
    
    return variant?.content || null;
  };

  return {
    activeTests,
    assignments,
    getVariantContent
  };
}