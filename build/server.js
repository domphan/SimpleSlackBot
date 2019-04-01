"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
var port = process.env.PORT || '3001';
app_1.app.listen(port, function () {
    console.log("Express server started on " + port);
});
//# sourceMappingURL=server.js.map