import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { MUSCLE_LABELS } from '../../constants/muscleGroups';
import { type MuscleId } from '../../types';

interface Props {
  muscleVolume: Partial<Record<MuscleId, number>>;
  style?: ViewStyle;
  compact?: boolean;
}

// Color scale: untrained → light → moderate → high
function getIntensityColor(sets: number): string {
  if (sets <= 0) return Colors.surfaceElevated;
  if (sets <= 2) return '#FFD700';   // gold — light
  if (sets <= 5) return '#FF8C00';   // dark orange — moderate
  return Colors.accent;              // iron red — high
}

function getMaxSets(volume: Partial<Record<MuscleId, number>>): number {
  const values = Object.values(volume);
  return values.length > 0 ? Math.max(...values) : 0;
}

// ─── SVG Paths ───────────────────────────────────────────────────────────────
// Simplified anatomical paths for front and back views (viewBox: 0 0 200 400)

const FRONT_PATHS: Record<string, { d: string; muscles: MuscleId[] }> = {
  chest_l: {
    d: 'M70,95 Q80,85 100,90 L100,120 Q85,125 70,115 Z',
    muscles: ['chest'],
  },
  chest_r: {
    d: 'M130,95 Q120,85 100,90 L100,120 Q115,125 130,115 Z',
    muscles: ['chest'],
  },
  front_delt_l: {
    d: 'M60,85 Q55,80 58,90 L65,100 Q70,90 70,85 Z',
    muscles: ['front_delts'],
  },
  front_delt_r: {
    d: 'M140,85 Q145,80 142,90 L135,100 Q130,90 130,85 Z',
    muscles: ['front_delts'],
  },
  side_delt_l: {
    d: 'M55,82 Q48,85 50,95 L58,90 Q55,80 55,82 Z',
    muscles: ['side_delts'],
  },
  side_delt_r: {
    d: 'M145,82 Q152,85 150,95 L142,90 Q145,80 145,82 Z',
    muscles: ['side_delts'],
  },
  bicep_l: {
    d: 'M52,100 Q48,115 50,135 L58,135 Q62,115 60,100 Z',
    muscles: ['biceps'],
  },
  bicep_r: {
    d: 'M148,100 Q152,115 150,135 L142,135 Q138,115 140,100 Z',
    muscles: ['biceps'],
  },
  forearm_l: {
    d: 'M48,140 Q45,160 46,180 L54,180 Q56,160 55,140 Z',
    muscles: ['forearms'],
  },
  forearm_r: {
    d: 'M152,140 Q155,160 154,180 L146,180 Q144,160 145,140 Z',
    muscles: ['forearms'],
  },
  core: {
    d: 'M85,125 L115,125 L115,195 Q100,200 85,195 Z',
    muscles: ['core'],
  },
  quad_l: {
    d: 'M75,200 Q70,240 68,280 L88,280 Q90,240 92,200 Z',
    muscles: ['quads'],
  },
  quad_r: {
    d: 'M125,200 Q130,240 132,280 L112,280 Q110,240 108,200 Z',
    muscles: ['quads'],
  },
};

const BACK_PATHS: Record<string, { d: string; muscles: MuscleId[] }> = {
  traps: {
    d: 'M80,75 Q100,70 120,75 L115,95 Q100,90 85,95 Z',
    muscles: ['traps'],
  },
  rear_delt_l: {
    d: 'M60,85 Q55,82 52,92 L60,100 Q65,92 65,88 Z',
    muscles: ['rear_delts'],
  },
  rear_delt_r: {
    d: 'M140,85 Q145,82 148,92 L140,100 Q135,92 135,88 Z',
    muscles: ['rear_delts'],
  },
  lats_l: {
    d: 'M68,100 Q65,120 70,150 L85,150 Q88,120 85,100 Z',
    muscles: ['lats'],
  },
  lats_r: {
    d: 'M132,100 Q135,120 130,150 L115,150 Q112,120 115,100 Z',
    muscles: ['lats'],
  },
  upper_back: {
    d: 'M85,95 Q100,90 115,95 L115,130 Q100,125 85,130 Z',
    muscles: ['upper_back'],
  },
  lower_back: {
    d: 'M85,150 Q100,145 115,150 L115,195 Q100,200 85,195 Z',
    muscles: ['lower_back'],
  },
  tricep_l: {
    d: 'M50,100 Q45,115 47,140 L55,140 Q58,115 57,100 Z',
    muscles: ['triceps'],
  },
  tricep_r: {
    d: 'M150,100 Q155,115 153,140 L145,140 Q142,115 143,100 Z',
    muscles: ['triceps'],
  },
  glutes_l: {
    d: 'M78,195 Q75,210 80,225 L100,225 Q100,210 100,195 Z',
    muscles: ['glutes'],
  },
  glutes_r: {
    d: 'M122,195 Q125,210 120,225 L100,225 Q100,210 100,195 Z',
    muscles: ['glutes'],
  },
  hamstring_l: {
    d: 'M72,230 Q68,260 66,290 L88,290 Q90,260 90,230 Z',
    muscles: ['hamstrings'],
  },
  hamstring_r: {
    d: 'M128,230 Q132,260 134,290 L112,290 Q110,260 110,230 Z',
    muscles: ['hamstrings'],
  },
  calf_l: {
    d: 'M70,295 Q68,325 70,360 L85,360 Q87,325 85,295 Z',
    muscles: ['calves'],
  },
  calf_r: {
    d: 'M130,295 Q132,325 130,360 L115,360 Q113,325 115,295 Z',
    muscles: ['calves'],
  },
};

// Head + body outline for both views
const BODY_OUTLINE = 'M100,15 Q115,15 115,30 Q115,45 110,50 L110,55 Q120,60 130,70 Q145,75 148,82 Q155,85 155,100 Q155,140 148,175 L148,180 Q145,180 142,175 L135,195 Q130,200 128,200 L132,240 Q135,280 134,295 Q136,330 132,365 L130,380 L115,380 Q113,360 112,340 L110,300 Q108,290 105,300 L105,340 Q105,360 100,380 L95,380 Q95,360 95,340 L90,300 Q88,290 85,300 L82,340 Q80,360 78,380 L65,380 Q62,365 64,330 L66,295 Q65,260 68,240 L72,200 Q70,200 65,195 L58,175 Q55,175 52,180 L52,175 Q45,140 45,100 Q45,85 52,82 Q55,75 70,70 Q80,60 90,55 L90,50 Q85,45 85,30 Q85,15 100,15 Z';

function getMuscleSetCount(
  muscles: MuscleId[],
  volume: Partial<Record<MuscleId, number>>
): number {
  return muscles.reduce((max, m) => Math.max(max, volume[m] ?? 0), 0);
}

export function MuscleHeatmap({ muscleVolume, style, compact }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [tooltip, setTooltip] = useState<{ muscle: string; sets: number } | null>(null);

  const paths = view === 'front' ? FRONT_PATHS : BACK_PATHS;
  const svgSize = compact ? 120 : 180;

  return (
    <View style={[styles.container, style]}>
      {!compact && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'front' && styles.toggleActive]}
            onPress={() => { setView('front'); setTooltip(null); }}
          >
            <Text style={[styles.toggleText, view === 'front' && styles.toggleTextActive]}>
              Front
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, view === 'back' && styles.toggleActive]}
            onPress={() => { setView('back'); setTooltip(null); }}
          >
            <Text style={[styles.toggleText, view === 'back' && styles.toggleTextActive]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.svgWrapper}>
        <Svg
          width={svgSize}
          height={svgSize * 2}
          viewBox="0 0 200 400"
        >
          {/* Body outline */}
          <Path
            d={BODY_OUTLINE}
            fill={Colors.surface}
            stroke={Colors.border}
            strokeWidth={1.5}
          />

          {/* Muscle groups */}
          <G>
            {Object.entries(paths).map(([key, { d, muscles }]) => {
              const sets = getMuscleSetCount(muscles, muscleVolume);
              return (
                <Path
                  key={key}
                  d={d}
                  fill={getIntensityColor(sets)}
                  opacity={sets > 0 ? 0.85 : 0.3}
                  onPress={() => {
                    if (!compact) {
                      const label = muscles.map(m => MUSCLE_LABELS[m]).join(', ');
                      setTooltip({ muscle: label, sets: Math.round(sets) });
                    }
                  }}
                />
              );
            })}
          </G>
        </Svg>
      </View>

      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            {tooltip.muscle}: {tooltip.sets} sets
          </Text>
        </View>
      )}

      {!compact && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.surfaceElevated }]} />
            <Text style={styles.legendLabel}>None</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.legendLabel}>Light</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF8C00' }]} />
            <Text style={styles.legendLabel}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendLabel}>High</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
  },
  toggleActive: {
    backgroundColor: Colors.accent,
  },
  toggleText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    marginTop: 8,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tooltipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
