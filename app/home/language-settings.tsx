import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as FlagStrings from 'country-flag-icons/string/3x2';

interface Language {
  code: string;
  name: string;
  flagCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flagCode: 'GB' },
  { code: 'es', name: 'Spanish', flagCode: 'ES' },
  { code: 'fr', name: 'French', flagCode: 'FR' },
  { code: 'de', name: 'German', flagCode: 'DE' },
  { code: 'hi', name: 'Hindi', flagCode: 'IN' },
  { code: 'ko', name: 'Korean', flagCode: 'KR' },
  { code: 'vi', name: 'Vietnamese', flagCode: 'VN' },
  { code: 'ar', name: 'Arabic', flagCode: 'AE' },
];

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedLang = LANGUAGES.find((lang) => lang.code === selectedLanguage) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={20} color="#1f1f1f" />
        </Pressable>
        <Text style={styles.headerTitle}>Language Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* You Selected Section */}
        <View style={styles.selectedSection}>
          <Text style={styles.selectedLabel}>You Selected</Text>
          <View style={styles.selectedCard}>
            <View style={styles.selectedCardContent}>
              <View style={styles.flagContainer}>
                <SvgXml
                  xml={(FlagStrings as any)[selectedLang.flagCode] || ''}
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                />
              </View>
              <Text style={styles.selectedLanguageName}>{selectedLang.name}</Text>
            </View>
            <View style={styles.checkmarkContainer}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Search and Language List Container */}
        <View style={styles.languageContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#4f4f4f" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9e9e9e"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Language List */}
          <ScrollView
            style={styles.languageListScroll}
            contentContainerStyle={styles.languageListContent}
            showsVerticalScrollIndicator={true}
          >
            {filteredLanguages.map((language) => {
              const isSelected = language.code === selectedLanguage;
              return (
                <Pressable
                  key={language.code}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                  onPress={() => setSelectedLanguage(language.code)}
                >
                  <View style={styles.languageItemContent}>
                    <View style={styles.flagContainer}>
                      <SvgXml
                        xml={(FlagStrings as any)[language.flagCode] || ''}
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </View>
                    <Text style={styles.languageName}>{language.name}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  >
                    {isSelected && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFBEA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 30,
    paddingBottom: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  selectedSection: {
    marginBottom: 24,
  },
  selectedLabel: {
    fontSize: 14,
    color: '#4f4f4f',
    marginBottom: 12,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#FFFFFF',
  },
  selectedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flagContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  selectedLanguageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageContainer: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFBEA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f1f1f',
  },
  languageListScroll: {
    maxHeight: 400,
  },
  languageListContent: {
    gap: 0,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  languageItemSelected: {
    backgroundColor: '#FFF9C4',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: '#1f1f1f',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E6E6',
    backgroundColor: '#FFFBEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
});
