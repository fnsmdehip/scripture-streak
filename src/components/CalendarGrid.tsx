import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface CalendarGridProps {
  readDates: string[];
  month: number;
  year: number;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarGrid({ readDates, month, year }: CalendarGridProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const readSet = new Set(readDates);
  const cells: Array<{ day: number | null; isRead: boolean; isToday: boolean }> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, isRead: false, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      day: d,
      isRead: readSet.has(dateStr),
      isToday: dateStr === todayStr,
    });
  }

  const rows: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{monthName}</Text>
      <View style={styles.headerRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((cell, cellIdx) => (
            <View key={cellIdx} style={styles.cell}>
              {cell.day !== null ? (
                <View
                  style={[
                    styles.dayCircle,
                    cell.isRead && styles.dayCircleRead,
                    cell.isToday && !cell.isRead && styles.dayCircleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      cell.isRead && styles.dayTextRead,
                      cell.isToday && !cell.isRead && styles.dayTextToday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </View>
              ) : (
                <View style={styles.dayCircle} />
              )}
            </View>
          ))}
          {row.length < 7 &&
            Array.from({ length: 7 - row.length }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.cell} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  monthTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  dayLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleRead: {
    backgroundColor: Colors.calendarActive,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: Colors.calendarToday,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dayTextRead: {
    color: Colors.surface,
    fontWeight: '700',
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
