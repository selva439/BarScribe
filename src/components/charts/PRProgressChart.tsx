import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../constants/colors';
import { type PersonalRecord } from '../../types';
import { formatDisplayDate } from '../../utils/dateHelpers';

interface Props {
  records: PersonalRecord[];
  exerciseName: string;
}

export function PRProgressChart({ records, exerciseName }: Props) {
  if (records.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Log at least 2 sessions to see progress</Text>
      </View>
    );
  }

  const data = records.map(r => ({
    value: Math.round(r.estimated_1rm * 10) / 10,
    label: formatDisplayDate(r.date).split(',')[0], // Just "Mon"
    dataPointText: String(Math.round(r.estimated_1rm)),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exerciseName} — Estimated 1RM Progress</Text>
      <LineChart
        data={data}
        height={180}
        width={Dimensions.get('window').width - 64}
        color={Colors.accent}
        thickness={2.5}
        dataPointsColor={Colors.accent}
        dataPointsRadius={4}
        startFillColor={Colors.accentMuted}
        endFillColor="transparent"
        areaChart
        curved
        hideDataPoints={data.length > 20}
        xAxisColor={Colors.border}
        yAxisColor={Colors.border}
        xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
        yAxisTextStyle={{ color: Colors.textMuted, fontSize: 10 }}
        backgroundColor="transparent"
        rulesColor={Colors.border}
        noOfSections={4}
        yAxisLabelSuffix="kg"
        hideRules={false}
        showVerticalLines={false}
        pointerConfig={{
          pointerColor: Colors.accent,
          pointerLabelComponent: (items: any[]) => (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{items[0].value}kg</Text>
            </View>
          ),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  tooltip: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  tooltipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
