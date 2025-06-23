import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { video } from "@/lib/mux";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { assetId, playbackId } = await request.json();

    if (!assetId && !playbackId) {
      return NextResponse.json({ error: "Asset ID ou Playback ID requis" }, { status: 400 });
    }

    // Si on a un playbackId, on doit d'abord récupérer l'assetId
    let actualAssetId = assetId;
    
    if (playbackId && !assetId) {
      try {
        // Récupérer tous les assets et trouver celui avec le bon playbackId
        const assets = await video.assets.list();
        const asset = assets.data.find(a => 
          a.playback_ids && a.playback_ids.some(p => p.id === playbackId)
        );
        
        if (asset) {
          actualAssetId = asset.id;
        } else {
          return NextResponse.json({ error: "Asset non trouvé" }, { status: 404 });
        }
      } catch (error) {
        console.error("Erreur lors de la recherche de l'asset:", error);
        return NextResponse.json({ error: "Erreur lors de la recherche de l'asset" }, { status: 500 });
      }
    }

    if (!actualAssetId) {
      return NextResponse.json({ error: "Asset ID introuvable" }, { status: 400 });
    }

    // Supprimer l'asset Mux
    await video.assets.delete(actualAssetId);

    return NextResponse.json({ 
      success: true, 
      message: "Asset Mux supprimé avec succès" 
    });

  } catch (error) {
    console.error("Erreur suppression asset Mux:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'asset vidéo" },
      { status: 500 }
    );
  }
} 