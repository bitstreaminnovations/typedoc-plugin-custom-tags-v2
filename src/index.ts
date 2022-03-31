/*
 * index.ts
 *
 * Main entrypoint
 *
 * Created:  2022/03/28
 * Author:   Chris Wilson
 *
 * Copyright © 2022 Bitstream Innovations, LLC.
 */

import { Application } from "typedoc";
import {TypeDocPlugin} from "./plugin";

/**
 * Initializes the TypeDoc plugin
 * @param app Reference to the TypeDoc application instance
 */
export const load = (app:Readonly<Application>) => {
  new TypeDocPlugin().initialize(app);
};

export default load;
