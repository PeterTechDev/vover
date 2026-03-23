/**
 * Unified DB API route — handles all client-side DB operations.
 * Called by @/lib/db-client for client components.
 * Auth is validated server-side via NextAuth.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getWatchlist,
  getWatchlistWithRecommender,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getWatched,
  markWatched,
  removeFromWatched,
  getFriends,
  getFriendsByUserId,
  sendFriendRequest,
  getFriendActivity,
  getEnhancedFriendActivity,
  getProfile,
  updateProfile,
  getRecommendationsForUser,
  sendRecommendation,
  getSharedLists,
  getSharedListById,
  getSharedListItems,
  createSharedList,
  addMemberToList,
  addItemToSharedList,
  removeItemFromSharedList,
  deleteSharedList,
  completeOnboarding,
  isOnboardingCompleted,
  getOrCreateInviteCode,
  getInviteByCode,
  incrementInviteUses,
  acceptInviteAndFriend,
  getInviteStats,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { method, ...params } = body as { method: string; [key: string]: unknown };

  try {
    switch (method) {
      // Watchlist
      case "getWatchlist":
        return NextResponse.json(await getWatchlist(userId));
      case "getWatchlistWithRecommender":
        return NextResponse.json(await getWatchlistWithRecommender(userId));
      case "addToWatchlist":
        return NextResponse.json(await addToWatchlist(userId, params.item as Parameters<typeof addToWatchlist>[1]));
      case "removeFromWatchlist":
        return NextResponse.json(await removeFromWatchlist(userId, params.id as string));
      case "isInWatchlist":
        return NextResponse.json({ result: await isInWatchlist(userId, params.tmdbId as number, params.mediaType as string) });

      // Watched
      case "getWatched":
        return NextResponse.json(await getWatched(userId));
      case "markWatched":
        return NextResponse.json(await markWatched(userId, params.item as Parameters<typeof markWatched>[1]));
      case "removeFromWatched":
        return NextResponse.json(await removeFromWatched(userId, params.id as string));

      // Friends
      case "getFriends":
        return NextResponse.json(await getFriends(userId));
      case "getFriendsByUserId":
        return NextResponse.json(await getFriendsByUserId(userId));
      case "sendFriendRequest":
        return NextResponse.json(await sendFriendRequest(userId, params.addresseeEmail as string));
      case "getFriendActivity":
        return NextResponse.json(await getFriendActivity(userId));
      case "getEnhancedFriendActivity":
        return NextResponse.json(await getEnhancedFriendActivity(userId));

      // Profile
      case "getProfile":
        return NextResponse.json(await getProfile(userId));
      case "updateProfile":
        return NextResponse.json(await updateProfile(userId, params.updates as Parameters<typeof updateProfile>[1]));

      // Recommendations
      case "getRecommendationsForUser":
        return NextResponse.json(await getRecommendationsForUser(userId));
      case "sendRecommendation":
        return NextResponse.json(
          await sendRecommendation(userId, params.toUserId as string, params.item as Parameters<typeof sendRecommendation>[2])
        );

      // Shared Lists
      case "getSharedLists":
        return NextResponse.json(await getSharedLists(userId));
      case "getSharedListById":
        return NextResponse.json(await getSharedListById(params.listId as string));
      case "getSharedListItems":
        return NextResponse.json(await getSharedListItems(params.listId as string));
      case "createSharedList":
        return NextResponse.json(await createSharedList(userId, params.name as string, params.description as string | undefined));
      case "addMemberToList":
        return NextResponse.json(await addMemberToList(params.listId as string, params.memberId as string, userId));
      case "addItemToSharedList":
        return NextResponse.json(
          await addItemToSharedList(params.listId as string, userId, params.item as Parameters<typeof addItemToSharedList>[2])
        );
      case "removeItemFromSharedList":
        return NextResponse.json(await removeItemFromSharedList(params.itemId as string));
      case "deleteSharedList":
        return NextResponse.json(await deleteSharedList(params.listId as string));

      // Onboarding
      case "completeOnboarding":
        return NextResponse.json(await completeOnboarding(userId));
      case "isOnboardingCompleted":
        return NextResponse.json({ result: await isOnboardingCompleted(userId) });

      // Invite Codes
      case "getOrCreateInviteCode":
        return NextResponse.json(await getOrCreateInviteCode(userId));
      case "getInviteByCode":
        return NextResponse.json(await getInviteByCode(params.code as string));
      case "incrementInviteUses":
        await incrementInviteUses(params.code as string);
        return NextResponse.json({ ok: true });
      case "acceptInviteAndFriend":
        return NextResponse.json(await acceptInviteAndFriend(params.inviterUserId as string, userId));
      case "getInviteStats":
        return NextResponse.json(await getInviteStats(userId));

      default:
        return NextResponse.json({ error: `Unknown method: ${method}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[api/db] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
