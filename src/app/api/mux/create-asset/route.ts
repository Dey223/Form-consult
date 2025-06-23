import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { video } from "@/lib/mux";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: "URL vidéo requise" }, { status: 400 });
    }

    // Créer l'asset Mux
    const asset = await video.assets.create({
      input: videoUrl,
      playback_policy: ["public"],
      test: false, // Mettre à true en développement
    });

    return NextResponse.json({
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
    });

  } catch (error) {
    console.error("Erreur création asset Mux:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'asset vidéo" },
      { status: 500 }
    );
  }
} 