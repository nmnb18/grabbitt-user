import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

export default function withSkeletonTransition<SkeletonProps = any>(
    SkeletonComponent: React.ComponentType<SkeletonProps>
) {
    return function <P extends { loading: boolean }>(
        WrappedComponent: React.ComponentType<P>
    ) {
        return function (props: P & SkeletonProps) {
            const { loading } = props;

            const [showSkeleton, setShowSkeleton] = useState(true);

            const skeletonOpacity = useRef(new Animated.Value(1)).current;
            const contentOpacity = useRef(new Animated.Value(0)).current;

            useEffect(() => {
                if (!loading) {
                    // fade out skeleton
                    Animated.timing(skeletonOpacity, {
                        toValue: 0,
                        duration: 350,
                        delay: 2000,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowSkeleton(false);

                        // fade-in actual content
                        Animated.timing(contentOpacity, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: true,
                        }).start();
                    });
                }
            }, [loading]);

            return (
                <View style={{ flex: 1 }}>
                    {showSkeleton && (
                        <Animated.View style={{ opacity: skeletonOpacity, flex: 1 }}>
                            <SkeletonComponent {...(props as any)} />
                        </Animated.View>
                    )}

                    {!showSkeleton && (
                        <Animated.View style={{ opacity: contentOpacity, flex: 1 }}>
                            <WrappedComponent {...props} />
                        </Animated.View>
                    )}
                </View>
            );
        };
    };
}
