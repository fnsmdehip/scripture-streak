import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Card } from '../components/Card';
import { BIBLE_BOOKS } from '../constants/bible';
import { VerseService } from '../services/verse';
import type { BibleBook, Verse } from '../types';

type ViewMode = 'books' | 'chapters' | 'verses';

export function BibleScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [testament, setTestament] = useState<'all' | 'old' | 'new'>('all');

  const filteredBooks = useMemo(() => {
    let books: BibleBook[] = [...BIBLE_BOOKS];
    if (testament !== 'all') {
      books = books.filter((b) => b.testament === testament);
    }
    if (searchQuery.trim()) {
      books = VerseService.searchBooks(searchQuery);
      if (testament !== 'all') {
        books = books.filter((b) => b.testament === testament);
      }
    }
    return books;
  }, [searchQuery, testament]);

  const chapterVerses = useMemo(() => {
    if (!selectedBook || selectedChapter === null) return [];
    return VerseService.getChapterVerses(selectedBook.name, selectedChapter);
  }, [selectedBook, selectedChapter]);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setViewMode('chapters');
    setSearchQuery('');
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setViewMode('verses');
  };

  const handleBack = () => {
    if (viewMode === 'verses') {
      setViewMode('chapters');
      setSelectedChapter(null);
    } else if (viewMode === 'chapters') {
      setViewMode('books');
      setSelectedBook(null);
    }
  };

  const renderBreadcrumb = () => {
    if (viewMode === 'books') return null;
    return (
      <View style={styles.breadcrumb}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.breadcrumbPath}>
          <Text style={styles.breadcrumbText}>
            {selectedBook?.name}
            {selectedChapter !== null ? ` ${selectedChapter}` : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderBookItem = ({ item }: { item: BibleBook }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleSelectBook(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookName}>{item.name}</Text>
        <Text style={styles.bookChapters}>
          {item.chapters} {item.chapters === 1 ? 'chapter' : 'chapters'}
        </Text>
      </View>
      <View style={[styles.testamentBadge, item.testament === 'old' ? styles.oldTestament : styles.newTestament]}>
        <Text style={[styles.testamentText, item.testament === 'old' ? styles.oldTestamentText : styles.newTestamentText]}>
          {item.testament === 'old' ? 'OT' : 'NT'}
        </Text>
      </View>
      <Text style={styles.chevron}>{'\u203A'}</Text>
    </TouchableOpacity>
  );

  const renderChapterGrid = () => {
    if (!selectedBook) return null;
    const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    return (
      <View style={styles.chapterGrid}>
        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch}
            style={styles.chapterCell}
            onPress={() => handleSelectChapter(ch)}
            activeOpacity={0.7}
          >
            <Text style={styles.chapterNumber}>{ch}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderVerseItem = ({ item }: { item: Verse }) => (
    <View style={styles.verseItem}>
      <Text style={styles.verseNumber}>{item.verse}</Text>
      <Text style={styles.verseContent}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Bible</Text>
        {viewMode === 'books' && (
          <>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>{'\uD83D\uDD0D'}</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search books..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButton}>{'\u2715'}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.filterRow}>
              {(['all', 'old', 'new'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterButton, testament === t && styles.filterButtonActive]}
                  onPress={() => setTestament(t)}
                >
                  <Text style={[styles.filterButtonText, testament === t && styles.filterButtonTextActive]}>
                    {t === 'all' ? 'All' : t === 'old' ? 'Old Testament' : 'New Testament'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {renderBreadcrumb()}

      {viewMode === 'books' && (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {viewMode === 'chapters' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          <Card>
            <Text style={styles.sectionTitle}>Select a Chapter</Text>
            {renderChapterGrid()}
          </Card>
        </ScrollView>
      )}

      {viewMode === 'verses' && (
        <FlatList
          data={chapterVerses}
          renderItem={renderVerseItem}
          keyExtractor={(item) => `${item.book}-${item.chapter}-${item.verse}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.chapterTitle}>
              {selectedBook?.name} {selectedChapter}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.sm + 2,
  },
  clearButton: {
    fontSize: 16,
    color: Colors.textMuted,
    padding: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.bodySmall,
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: Colors.surface,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  backText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  breadcrumbPath: {
    flex: 1,
  },
  breadcrumbText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    ...Typography.body,
    fontWeight: '600',
  },
  bookChapters: {
    ...Typography.bodySmall,
    fontSize: 13,
  },
  testamentBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  oldTestament: {
    backgroundColor: '#F0E8DC',
  },
  newTestament: {
    backgroundColor: '#E8F0E8',
  },
  testamentText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  oldTestamentText: {
    color: Colors.primary,
  },
  newTestamentText: {
    color: Colors.success,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  chapterCell: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chapterNumber: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  chapterTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  verseItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  verseNumber: {
    ...Typography.verseRef,
    width: 28,
    marginRight: Spacing.sm,
    textAlign: 'right',
    marginTop: 2,
  },
  verseContent: {
    ...Typography.body,
    flex: 1,
    lineHeight: 26,
  },
});
