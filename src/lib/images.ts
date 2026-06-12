import { decode } from 'base64-arraybuffer';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { MAX_PHOTOS_PER_UPLOAD } from '@/constants/config';
import { supabase } from '@/lib/supabase';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/** Sized for Indian mobile networks: ~150–250 KB mains, tiny list thumbs. */
const MAIN_MAX_WIDTH = 1280;
const THUMB_WIDTH = 320;
const JPEG_QUALITY = 0.7;

export async function pickImages(limit = MAX_PHOTOS_PER_UPLOAD): Promise<PickedImage[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    exif: false,
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => ({ uri: a.uri, width: a.width, height: a.height }));
}

export async function takePhoto(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchCameraAsync({ quality: 0.8, exif: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width, height: asset.height };
}

async function renderJpegBase64(
  uri: string,
  targetWidth: number,
  sourceWidth: number,
): Promise<{ base64: string; width: number; height: number }> {
  const context = ImageManipulator.manipulate(uri);
  if (sourceWidth > targetWidth) {
    context.resize({ width: targetWidth });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: JPEG_QUALITY,
    base64: true,
  });
  if (!saved.base64) throw new Error('Image encoding failed');
  return { base64: saved.base64, width: saved.width, height: saved.height };
}

export interface UploadedImage {
  path: string;
  thumbPath: string;
  width: number;
  height: number;
}

/**
 * Compress to a 1280px main + 320px thumb and upload both to a public bucket.
 * Uploads as ArrayBuffer — Blob uploads are unreliable in React Native.
 */
export async function compressAndUpload(
  bucket: 'avatars' | 'dog-media',
  pathPrefix: string,
  image: PickedImage,
): Promise<UploadedImage> {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${pathPrefix}/${id}.jpg`;
  const thumbPath = `${pathPrefix}/${id}_thumb.jpg`;

  const main = await renderJpegBase64(image.uri, MAIN_MAX_WIDTH, image.width);
  const thumb = await renderJpegBase64(image.uri, THUMB_WIDTH, image.width);

  const upload = async (objectPath: string, base64: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, decode(base64), { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
  };

  await upload(path, main.base64);
  await upload(thumbPath, thumb.base64);

  return { path, thumbPath, width: main.width, height: main.height };
}
