import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Pressable,
    Image as RNImage,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAuthStore } from '@/store/auth-store';
import { router } from 'expo-router';
import Animated, {
    Extrapolate,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.55;
const CARD_SPACING = 40;
const CENTER_CARD_SCALE = 1.15;
const CENTER_CARD_HEIGHT = 260;
const SIDE_CARD_HEIGHT = 230;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const HORIZONTAL_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2.75;

const onboardingData = [
  {
    id: '1',
    image: require('@/assets/app/carousel-left.png'),
    text: 'Browse delivery requests around you and decide which ones you want to take.',
  },
  {
    id: '2',
    image: require('@/assets/app/carousel-center.png'),
    text: 'Pick your hours and ride when it works for you. Your time, your pace.',
  },
  {
    id: '3',
    image: require('@/assets/app/carousel-right.png'),
    text: 'Receive weekly payouts and grow your rating with every delivery.',
  },
];

const BASE_DATA_LENGTH = onboardingData.length;
const DUPLICATION_FACTOR = 3;
const INFINITE_DATA = Array.from({ length: DUPLICATION_FACTOR }).flatMap(() => onboardingData);
const START_INDEX = BASE_DATA_LENGTH; // middle block
const TOTAL_ITEMS = INFINITE_DATA.length;
const INITIAL_OFFSET = START_INDEX * SNAP_INTERVAL;

const OnboardingCard = ({
  item,
  index,
  scrollX,
}: {
  item: (typeof onboardingData)[0];
  index: number;
  scrollX: SharedValue<number>;
}) => {
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [1, CENTER_CARD_SCALE, 1],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const heightStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollX.value,
      inputRange,
      [SIDE_CARD_HEIGHT, CENTER_CARD_HEIGHT, SIDE_CARD_HEIGHT],
      Extrapolate.CLAMP
    );

    return {
      height,
    };
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        animatedStyle,
        { width: CARD_WIDTH },
      ]}>
      <Animated.View style={[styles.card, heightStyle]}>
        <RNImage source={item.image} style={styles.cardImage} resizeMode="cover" />
      </Animated.View>
    </Animated.View>
  );
};

const MemoizedOnboardingCard = React.memo(OnboardingCard);

export default function OnboardingScreen() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home' as any);
    }
  }, [isAuthenticated]);
  const scrollX = useSharedValue(INITIAL_OFFSET);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Ensure the list starts at the middle block for seamless looping
    flatListRef.current?.scrollToOffset({
      offset: INITIAL_OFFSET,
      animated: false,
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumScrollEnd = (event: any) => {
    let offsetX = event.nativeEvent.contentOffset.x;
    let index = Math.round(offsetX / SNAP_INTERVAL);

    if (index < BASE_DATA_LENGTH) {
      index += BASE_DATA_LENGTH;
      offsetX = index * SNAP_INTERVAL;
      flatListRef.current?.scrollToOffset({ offset: offsetX, animated: false });
    } else if (index >= TOTAL_ITEMS - BASE_DATA_LENGTH) {
      index -= BASE_DATA_LENGTH;
      offsetX = index * SNAP_INTERVAL;
      flatListRef.current?.scrollToOffset({ offset: offsetX, animated: false });
    }

    scrollX.value = offsetX;
    setCurrentIndex(index % BASE_DATA_LENGTH);
  };

  const handleGetStarted = () => {
    router.push('/auth/identity-verification');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof onboardingData)[0]; index: number }) => (
      <MemoizedOnboardingCard item={item} index={index} scrollX={scrollX} />
    ),
    [scrollX]
  );

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={INFINITE_DATA}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={styles.flatListContent}
          initialScrollIndex={START_INDEX}
          getItemLayout={(_, index) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
          })}
          onScroll={scrollHandler}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          renderItem={renderItem}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.onboardingText}>
          {onboardingData[currentIndex].text}
        </Text>
      </View>

      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.getStartedButton}
          onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </Pressable>

        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login to Existing Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8B3',
    paddingTop: 60,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    alignItems: 'center',
  },
  cardContainer: {
    marginHorizontal: CARD_SPACING / 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E2E2E',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignSelf: 'stretch',
  },
  textContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  onboardingText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F1F1F',
    textAlign: 'center',
    fontWeight: '400',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: '#FFD700',
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  loginButton: {
    backgroundColor: '#F2F2F2',
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F4F4F',
  },
});

