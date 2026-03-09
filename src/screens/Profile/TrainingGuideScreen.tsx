import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';

interface EntryProps {
  term: string;
  full?: string;
  description: string;
  formula?: string;
  example?: string;
}

function Entry({ term, full, description, formula, example }: EntryProps) {
  return (
    <Card bordered style={styles.entry}>
      <View style={styles.termRow}>
        <Text style={styles.term}>{term}</Text>
        {full && <Text style={styles.full}>{full}</Text>}
      </View>
      <Text style={styles.description}>{description}</Text>
      {formula && (
        <View style={styles.formulaBox}>
          <Text style={styles.formula}>{formula}</Text>
        </View>
      )}
      {example && <Text style={styles.example}>{example}</Text>}
    </Card>
  );
}

export default function TrainingGuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Section: Abbreviations */}
        <Text style={styles.sectionHeader}>ABBREVIATIONS</Text>

        <Entry
          term="PR"
          full="Personal Record"
          description="Your all-time best performance on a lift, tracked automatically. BarScribe compares every logged set against your best estimated 1RM for that exercise."
        />

        <Entry
          term="RPE"
          full="Rate of Perceived Exertion"
          description="A 1-10 scale rating how hard a set felt. Developed by powerlifting coach Mike Tuchscherer based on Borg's original scale. Half-steps (7.5, 8.5) are common."
          example="6 = 4+ reps left  |  7 = 3 reps left  |  8 = 2 reps left\n9 = 1 rep left  |  9.5 = maybe 1 more  |  10 = absolute max"
        />

        <Entry
          term="1RM"
          full="One Rep Max"
          description="The maximum weight you can lift for a single repetition. Rarely tested directly — usually estimated from a heavier set using the Epley formula."
        />

        <Entry
          term="e1RM"
          full="Estimated 1RM"
          description="Your predicted one-rep max calculated from a multi-rep set. This is how BarScribe tracks PRs without you needing to max out."
        />

        <Entry
          term="TM"
          full="Training Max"
          description="Used in 5/3/1 programming. Set at 90% of your true 1RM so you train sub-maximally and progress over time. All percentages in 5/3/1 are based on TM, not actual 1RM."
          formula="TM = 1RM × 0.90 (rounded to nearest 2.5kg)"
        />

        <Entry
          term="AMRAP"
          full="As Many Reps As Possible"
          description="The final set in 5/3/1 where you push for maximum reps at the prescribed weight. This is where PRs happen."
        />

        <Entry
          term="SBD"
          full="Squat / Bench / Deadlift"
          description="The three competition lifts in powerlifting. Your 'total' is the sum of your best squat, bench, and deadlift."
        />

        <Entry
          term="OHP"
          full="Overhead Press"
          description="Standing barbell press. Not a competition lift but a core movement in 5/3/1 and many strength programs."
        />

        {/* Section: Formulas */}
        <Text style={styles.sectionHeader}>FORMULAS</Text>

        <Entry
          term="Epley Formula"
          description="The most widely used 1RM estimation formula. Accurate for 2-10 reps. Used by BarScribe for all PR calculations."
          formula="e1RM = weight × (1 + reps ÷ 30)"
          example="100kg × 5 reps → 100 × (1 + 5/30) = 116.7kg e1RM"
        />

        <Entry
          term="Wilks Score"
          description="A bodyweight-normalized strength score used by the IPF (International Powerlifting Federation). Compares lifters across different weight classes. Uses a 5th-degree polynomial."
          formula="Wilks = Total × (500 ÷ Σ(a + b·BW + c·BW² + d·BW³ + e·BW⁴ + f·BW⁵))"
          example="Beginner < 200  |  Intermediate 200-300  |  Advanced 300-400\nMaster 400-500  |  Elite 500+"
        />

        <Entry
          term="DOTS Score"
          description="A newer bodyweight-normalized score, also IPF-approved. Uses a 4th-degree polynomial. Generally considered more accurate at extreme bodyweights than Wilks."
          formula="DOTS = Total × (500 ÷ Σ(a + b·BW + c·BW² + d·BW³ + e·BW⁴))"
          example="Beginner < 200  |  Intermediate 200-280  |  Advanced 280-375\nMaster 375-450  |  Elite 450+"
        />

        {/* Section: Scoring */}
        <Text style={styles.sectionHeader}>WORKOUT SCORING</Text>

        <Entry
          term="Volume Load"
          description="Total work done in a session. The standard powerlifting metric for tracking training stress, used by coaches like Boris Sheiko."
          formula="Volume Load = Σ(weight × reps)  for all working sets"
          example="Squat: 100kg × 5 × 5 sets = 2,500kg volume load"
        />

        <Entry
          term="INOL"
          full="Intensity-Number of Lifts"
          description="A training load metric by Hristo Hristov that accounts for both volume and intensity relative to your 1RM. Used by Sheiko and USAPL coaches to manage fatigue."
          formula="INOL = reps ÷ (100 − intensity%)\nIntensity% = (weight ÷ e1RM) × 100"
          example="Per exercise: 0.4-1.0 = optimal  |  1.0-2.0 = hard\nSession total: 2-4 = productive  |  4+ = overreaching"
        />

        <Entry
          term="Workout Score"
          description="BarScribe's 0-100 composite score combining volume load (40%), INOL (30%), muscle coverage (20%), and PR bonuses (10%). Helps you gauge session quality at a glance."
          example="0-25: Light Recovery  |  25-50: Moderate\n50-75: Hard  |  75-100: Maximum Effort"
        />

        {/* Section: Programs */}
        <Text style={styles.sectionHeader}>PROGRAMS</Text>

        <Entry
          term="5/3/1"
          full="Wendler's 5/3/1"
          description="Jim Wendler's 4-week wave loading program. Focuses on slow, steady progression with sub-maximal training. Each cycle: Week 1 (5s), Week 2 (3s), Week 3 (5/3/1), Week 4 (deload). After each cycle, add 5lbs to upper body TM, 10lbs to lower body TM."
          example="Week 1: 65% × 5, 75% × 5, 85% × 5+ (AMRAP)\nWeek 2: 70% × 3, 80% × 3, 90% × 3+\nWeek 3: 75% × 5, 85% × 3, 95% × 1+"
        />

        <Entry
          term="Smolov Jr"
          description="A 3-week high-frequency peaking block designed to push a single lift. Run it for one lift at a time (usually squat or bench). 4 days per week with increasing weight each week."
          example="Mon 6×6 @ 70%  |  Wed 7×5 @ 75%\nFri 8×4 @ 80%  |  Sat 10×3 @ 85%\nAdd 5-7.5kg each week"
        />

        <Entry
          term="Texas Method"
          description="Glenn Pendlay's 3-day program cycling Volume → Recovery → Intensity. Designed for intermediate lifters who have exhausted linear progression."
          example="Mon (Volume): 5×5 @ 90% of 5RM\nWed (Recovery): 2×5 @ 80%\nFri (Intensity): 1×5 (attempt new 5RM PR)"
        />

        {/* Section: Muscle Heatmap */}
        <Text style={styles.sectionHeader}>MUSCLE HEATMAP</Text>

        <Entry
          term="How It Works"
          description="Each exercise targets primary muscles (full credit) and secondary muscles (half credit). The heatmap colors muscles based on how many effective sets they received in the session."
          example="No color = untrained  |  Gold = 1-2 sets (light)\nOrange = 3-5 sets (moderate)  |  Red = 6+ sets (high)"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sources: NSCA, IPF Technical Rules, Wendler (5/3/1 Forever),{'\n'}
            Sheiko (Powerlifting Foundations), Hristov (INOL)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 10, paddingBottom: 40 },

  sectionHeader: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 12,
    marginBottom: 2,
  },

  entry: { gap: 6 },
  termRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  term: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  full: { color: Colors.textMuted, fontSize: 13 },
  description: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  formulaBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  formula: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  example: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { color: Colors.textDisabled, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
