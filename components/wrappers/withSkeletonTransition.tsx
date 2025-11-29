import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

interface SkeletonTransitionProps {
    loading?: boolean;
    hasData?: boolean;
}

export default function withSkeletonTransition<SkeletonProps = any>(
    SkeletonComponent: React.ComponentType<SkeletonProps>
) {
    return function <P extends SkeletonTransitionProps>(
        WrappedComponent: React.ComponentType<P>
    ) {
        return function (props: P & SkeletonProps) {
            const { loading = false, hasData = false } = props;

            const [showSkeleton, setShowSkeleton] = useState(true);
            const [showContent, setShowContent] = useState(false);

            const skeletonOpacity = useRef(new Animated.Value(1)).current;
            const contentOpacity = useRef(new Animated.Value(0)).current;

            useEffect(() => {
                // Show skeleton when loading OR when no data yet
                const shouldShowSkeleton = loading || !hasData;

                if (!shouldShowSkeleton && showSkeleton) {
                    // Data is loaded and we have data → transition to content
                    Animated.timing(skeletonOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowSkeleton(false);
                        setShowContent(true);

                        Animated.timing(contentOpacity, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }).start();
                    });
                } else if (shouldShowSkeleton && !showSkeleton) {
                    // Need to show skeleton again (e.g., pull to refresh)
                    setShowContent(false);
                    setShowSkeleton(true);
                    skeletonOpacity.setValue(1);
                    contentOpacity.setValue(0);
                }
            }, [loading, hasData, showSkeleton]);

            return (
                <View style={{ flex: 1 }}>
                    {showSkeleton && (
                        <Animated.View
                            style={{
                                opacity: skeletonOpacity,
                                flex: 1,
                                position: showContent ? 'absolute' : 'relative'
                            }}
                        >
                            <SkeletonComponent {...(props as any)} />
                        </Animated.View>
                    )}

                    {showContent && (
                        <Animated.View
                            style={{
                                opacity: contentOpacity,
                                flex: 1,
                            }}
                        >
                            <WrappedComponent {...props} />
                        </Animated.View>
                    )}
                </View>
            );
        };
    };
}