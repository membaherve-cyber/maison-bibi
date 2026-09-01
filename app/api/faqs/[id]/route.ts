import { makeItemHandlers } from "@/lib/crud";
import { RESOURCES } from "@/lib/resources";

export const dynamic = "force-dynamic";

const handlers = makeItemHandlers(RESOURCES["faqs"]);
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
