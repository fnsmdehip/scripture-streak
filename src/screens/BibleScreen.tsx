import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Card } from '../components/Card';
import { BIBLE_BOOKS } from '../constants/bible';
import { VerseService } from '../services/verse';
import { StorageService } from '../services/storage';
import type { BibleBook, Verse } from '../types';

type ViewMode = 'books' | 'chapters' | 'verses';

export function BibleScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [testament, setTestament] = useState<'all' | 'old' | 'new'>('all');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const animateTransition = useCallback((forward: boolean) => {
    slideAnim.setValue(forward ? 30 : -30);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleSelectBook = (book: BibleBook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBook(book);
    setViewMode('chapters');
    setSearchQuery('');
    animateTransition(true);
  };

  const handleSelectChapter = (chapter: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChapter(chapter);
    setViewMode('verses');
    animateTransition(true);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMode === 'verses') {
      setViewMode('chapters');
      setSelectedChapter(null);
      setSelectedVerse(null);
      animateTransition(false);
    } else if (viewMode === 'chapters') {
      setViewMode('books');
      setSelectedBook(null);
      animateTransition(false);
    }
  };

  const handleBookmarkVerse = async (verse: Verse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await StorageService.addBookmark({
      id: `${verse.book}-${verse.chapter}-${verse.verse}-${Date.now()}`,
      verse,
      date: new Date().toISOString(),
    });
    setSelectedVerse(verse);
    setTimeout(() => setSelectedVerse(null), 1500);
  };

  const handleCopyVerse = async (verse: Verse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ref = VerseService.formatReference(verse);
    const text = `\u201C${verse.text}\u201D \u2014 ${ref} (${verse.translation})`;
    await Clipboard.setStringAsync(text);
    setCopiedVerse(`${verse.book}-${verse.chapter}-${verse.verse}`);
    setTimeout(() => setCopiedVerse(null), 1500);
  };

  const handleShareVerse = async (verse: Verse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ref = VerseService.formatReference(verse);
    const text = `\u201C${verse.text}\u201D\n\n\u2014 ${ref} (${verse.translation})\n\nShared via Scripture Streak`;
    try {
      await Share.share({ message: text });
    } catch {
      await Clipboard.setStringAsync(text);
    }
  };

  const renderBreadcrumb = () => {
    if (viewMode === 'books') return null;
    return (
      <View style={styles.breadcrumb}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.gold} style={{ marginRight: Spacing.xs }} />
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
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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

  const verseKey = (item: Verse) => `${item.book}-${item.chapter}-${item.verse}`;

  const renderVerseItem = ({ item }: { item: Verse }) => {
    const key = verseKey(item);
    const isBookmarked = selectedVerse && verseKey(selectedVerse) === key;
    const isCopied = copiedVerse === key;
    return (
      <View style={styles.verseItem}>
        <Text style={styles.verseNumber}>{item.verse}</Text>
        <View style={styles.verseContentWrap}>
          <Text style={styles.verseContent}>{item.text}</Text>
          <View style={styles.verseItemActions}>
            <TouchableOpacity
              onPress={() => handleBookmarkVerse(item)}
              style={styles.verseActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isBookmarked ? 'checkmark-circle' : 'bookmark-outline'}
                size={14}
                color={isBookmarked ? Colors.success : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCopyVerse(item)}
              style={styles.verseActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                size={14}
                color={isCopied ? Colors.success : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleShareVerse(item)}
              style={styles.verseActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-outline" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Empty state for search
  const renderEmptySearch = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={48} color={Colors.textMuted} style={{ marginBottom: Spacing.md }} />
      <Text style={styles.emptyTitle}>No Books Found</Text>
      <Text style={styles.emptyMessage}>
        Try a different search term or browse by testament.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={styles.title}>Bible</Text>
        {viewMode === 'books' && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
              <TextInput
                style={styles.searchInput}
                placeholder=""
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.filterRow}>
              {(['all', 'old', 'new'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterButton, testament === t && styles.filterButtonActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTestament(t);
                  }}
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

      <Animated.View style={[styles.animatedContent, { transform: [{ translateX: slideAnim }] }]}>
        {viewMode === 'books' && (
          <FlatList
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptySearch}
          />
        )}

        {viewMode === 'chapters' && (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
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
            keyExtractor={(item) => verseKey(item)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.chapterTitle}>
                {selectedBook?.name} {selectedChapter}
              </Text>
            }
          />
        )}
      </Animated.View>
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
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.sm + 2,
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
    minHeight: 36,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterButtonText: {
    ...Typography.bodySmall,
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: Colors.textOnDark,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    minHeight: 48,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
    minHeight: 44,
    paddingRight: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Colors.gold,
    fontWeight: '600',
  },
  breadcrumbPath: {
    flex: 1,
  },
  breadcrumbText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  animatedContent: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
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
    fontWeight: '300',
    lineHeight: 24,
  },
  testamentBadge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  oldTestament: {
    backgroundColor: Colors.accentMuted,
  },
  newTestament: {
    backgroundColor: Colors.successLight,
  },
  testamentText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  oldTestamentText: {
    color: Colors.gold,
  },
  newTestamentText: {
    color: Colors.success,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    textAlign: 'center',
    paddingTop: 24,
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
    color: Colors.navy,
    fontVariant: ['tabular-nums'],
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
    fontVariant: ['tabular-nums'],
  },
  verseContentWrap: {
    flex: 1,
  },
  verseContent: {
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  verseItemActions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  verseActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    ...Typography.bodySmall,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    fontWeight: '300',
    lineHeight: 24,
  },
});
