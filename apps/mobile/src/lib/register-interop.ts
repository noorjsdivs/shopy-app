import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';

// Let gloss primitives accept `className` (mapped to their `style` prop).
// Imported once from app/_layout.tsx.
cssInterop(LinearGradient, { className: 'style' });
cssInterop(BlurView, { className: 'style' });
cssInterop(Image, { className: 'style' });
