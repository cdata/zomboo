var connect = require('connect'),
    zombie = require('zombie'),
    util = require('util'),
    http = require('http');

var validBoards = { a : true,  b : true,  c : true,  d : true,  e : true,  f : true,  g : true,  gif : true,  h : true,  hr : true,  k : true,  m : true,  o : true,  p : true,  r : true,  s : true,  t : true,  u : true,  v : true, w : true, wg : true,  i : true,  ic : true,  cm : true,  y : true,  adv : true,  an : true,  cgl : true,  ck : true,  co : true,  fa : true,  fit : true,  int : true,  jp : true,  lit : true,  mu : true,  n : true,  po : true,  sci : true,  soc : true,  sp : true,  tg : true,  toy : true,  trv : true,  tv : true,  vp : true,  x : true };


connect(
    connect.logger({format: ":date :url :referrer :status"}),
    connect.router(
        function(app) {

            app.get(

                "/:board",
                function(userReq, userRes) {

                    var board = userReq.params.board,
                        page = Math.round(Math.random() * 15);

                    if(validBoards[board]) {

                        util.log('Heading to http://boards.4chan.org/' + board + '/' + page);
                        zombie.visit(
                            "http://boards.4chan.org/" + board + "/" + page,
                            {
                                debug: false,
                                runScripts: false
                            },
                            function(err, browser, status) {

                                if(!err) {

                                    util.log('Got to the board. Checking out one of the posts.. ');

                                    browser.clickLink(
                                        'a[href^="res/"]:first',
                                        function(err, browser, status) {

                                            if(!err) {

                                                var images = browser.querySelectorAll('a[href^="http://images.4chan.org"]'),
                                                    target = images[Math.floor(Math.random()) * images.length],
                                                    src = target.attributes['1'].nodeValue;

                                                util.log('Found an image! Proxying ' + src);

                                                http.get(

                                                    {
                                                        host: "images.4chan.org",
                                                        port: 80,
                                                        path: src
                                                    },
                                                    function(res) {

                                                        if(res.statusCode == 200) {

                                                            util.log('Sending image back to client..');
                                                            userRes.writeHead(
                                                                200,
                                                                res.headers
                                                            );

                                                            res.on(
                                                                'data',
                                                                function(data) {

                                                                    userRes.write(data);
                                                                }
                                                            ).on(
                                                                'end',
                                                                function() {

                                                                    util.log('Done!');
                                                                    userRes.end();
                                                                }
                                                            );
                                                        } else {

                                                            userRes.end();
                                                            util.log("ERROR: Got " + res.statusCode + " while trying to retrieve " + src);
                                                        }
                                                    }
                                                );
                                            } else {

                                                userRes.end();
                                                util.log('Error clicking link..');
                                                util.log(err);
                                            }
                                        }
                                    );

                                } else {

                                    util.log(err);
                                    userRes.end();
                                }
                            }
                        );
                    } else {

                        userRes.end();
                    }
                }
            );
        }
    )

).listen(7331);
