import React from "react";
import { Image, ImageSourcePropType, StyleSheet, ViewStyle } from "react-native";

type Props = {
  source?: ImageSourcePropType;
  size?: number;
  style?: ViewStyle;
};

export default function AppIcon({ source, size = 64, style }: Props) {
  const src = source ?? require("../assets/images/icon.png");

  return (
    <Image source={src} style={[styles.icon, { width: size, height: size }, style]} resizeMode="contain" />
  );
}

const styles = StyleSheet.create({
  icon: {
    // keep defaults minimal; consumers can override via `size` or `style`
    borderRadius: 8,
  },
});
