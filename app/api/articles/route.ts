import { makeCollectionHandlers } from "@/lib/crud";
import { RESOURCES } from "@/lib/resources";

export const dynamic = "force-dynamic";

const handlers = makeCollectionHandlers(RESOURCES["articles"]);
export const GET = handlers.GET;
export const POST = handlers.POST;
