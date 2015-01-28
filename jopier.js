/**
 * Created by Franz on 1/24/2015.
 */

(function () {
    'use strict';

    function getOffsetRect(element) {
        var htmlElement = element[0];
        // (1) Get the enclosing rectangle.
        var box = htmlElement.getBoundingClientRect()
        var body = document.body
        var docElem = document.documentElement
        // (2) Calculate the page scroll. All browsers except IE<9 support `pageXOffset/pageYOffset`, and in IE when DOCTYPE is set, the scroll can be taken from documentElement(<html>), otherwise from `body` - so we take what we can.
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
        // (3) The document (`html` or `body`) can be shifted from left-upper corner in IE. Get the shift.
        var clientTop = docElem.clientTop || body.clientTop || 0
        var clientLeft = docElem.clientLeft || body.clientLeft || 0
        // (4) Add scrolls to window-relative coordinates and substract the shift of `html/body` to get coordinates in the whole document.
        var top = box.top + scrollTop - clientTop
        var left = box.left + scrollLeft - clientLeft
        return {top: Math.round(top), left: Math.round(left)}
    }

    angular.module('jopier', [])
        // ===============
        // Jopier Providr
        // ===============
        .provider('$jopier', function () {

            var buttonTemplate = '<button class="jopier-button" ng-click="editContent()" ng-show="renderButton">Joppy It</button>',
                formTemplate =
                    '<div class="jopier-form" ng-show="renderForm">' +
                    '<div class="jopier-form-container"><form name="jopierForm" novalidate>' +
                    '<div class="jopier-form-title"><span>Edit Content (this form is resizeable)</span></div>' +
                    '<div class="jopier-form-control"><label>Key</label>:</div><div class="jopier-form-control"><input type="text" name="key" ng-model="key" disabled/></div>' +
                    '<div class="jopier-form-control"><label>Content</label>:</div><div class="jopier-form-control"><textarea name="content" ng-model="content"/></div>' +
                    '<div class="jopier-form-control jopier-form-buttons"><input type="submit" value="Save" ng-click="save()">&nbsp;&nbsp;<input type="button" value="Cancel" ng-click="cancel()"></div>' +
                    '</form></div>' +
                    '</div>',
                buttonOffsetLeftPixels = -10,
                buttonOffsetTopPixels = -25,
                formOffsetLeftPixels = +10,
                formOffsetTopPixels = +25,
                preload = true,
                restPath = '/jopier';


            this.formTemplate = function (template) {
                if (template) {
                    formTemplate = template;
                } else {
                    return formTemplate;
                }
            };

            this.buttonTemplate = function (template) {
                if (template) {
                    buttonTemplate = template;
                } else {
                    return buttonTemplate;
                }
            };

            this.preload = function (trueOrFalse) {
                if (trueOrFalse) {
                    preload = trueOrFalse;
                } else {
                    return preload;
                }
            };

            this.setRestPath = function (path) {
                restPath = path;
            };

            this.buttonOffsetLeftPixels = function (number) {
                buttonOffsetLeftPixels = number;
            };

            this.buttonOffsetTopPixels = function (number) {
                buttonOffsetTopPixels = number;
            };
            this.formOffsetLeftPixels = function (number) {
                formOffsetLeftPixels = number;
            };

            this.formOffsetTopPixels = function (number) {
                formOffsetTopPixels = number;
            };

            // ==============
            // Jopier Service
            // ==============
            function JopierService($q, $http, $timeout) {
                var cachedContent = {};
                var authToken;
                var preloading = false;

                if (preload) {
                    preloading = true;
                    var start = Date.now();
                    $http.get(restPath).
                        success(function (data, status, headers, config) {
                            cachedContent = data;
                            preloading = false;
                            console.log('Preload millis: ' + (Date.now()-start));
                        }).error(function (data, status, headers, config) {
                            var err = new Error('Could not preload (' + status + '): ' + data);
                            console.log(err);
                            preloading = false;
                            console.log('Preload millis: ' + (Date.now()-start));
                        });
                }
                this._formTemplate = function () {
                    return formTemplate;
                };
                this._buttonTemplate = function () {
                    return buttonTemplate;
                };
                this.authToken = function (token) {
                    authToken = token;
                };
                this.content = function (key, content) {
                    var self = this;
                    var start = Date.now();
                    if (content) {
                        return $q(function serviceSaveContent(resolve, reject) {
                            var uri = restPath + '/' + key;
                            $http.post(uri, {content: content, authToken: authToken}).
                                success(function (data, status, headers, config) {
                                    cache(key, content);
                                    console.log('Post Content millis: ' + (Date.now()-start));
                                    resolve('Success');
                                }).error(function (data, status, headers, config) {
                                    var err = new Error('Status ' + status + ': ' + data.message);
                                    reject(err);
                                });
                        });
                    } else {
                        return $q(function serviceGetContent(resolve, reject) {
                            (function delayLoading() {
                                var delay = preloading ? 25 : 0;
                                $timeout(function () {
                                    if (preloading) {
                                        delayLoading();
                                    } else {
                                        var resolvedContent = cache(key);
                                        if (resolvedContent) {
                                            console.log('Get Content (Cache) millis: ' + (Date.now()-start));
                                            resolve(resolvedContent);
                                        }
                                        if (!resolvedContent) {
                                            var uri = restPath + '/' + key;
                                            $http.get(uri).
                                                success(function (data, status, headers, config) {
                                                    cache(key, data.content);
                                                    console.log('Get Content millis: ' + (Date.now()-start));
                                                    resolve(data.content);
                                                }).error(function (data, status, headers, config) {
                                                    if (status == 404 && typeof data === 'string' && data.indexOf('No content found for key') === 0) {
                                                        resolve('No content found for key ' + key + '. To add entry, replace this message with content and save');
                                                    } else {
                                                        var err = new Error('Status ' + status + ': ' + data.message);
                                                        reject(err);
                                                    }
                                                });
                                        }
                                    }
                                },delay);
                            })();
                        });
                    }
                };


                this._buttonOffsetLeftPixels = function () {
                    return buttonOffsetLeftPixels;
                };
                this._buttonOffsetTopPixels = function () {
                    return buttonOffsetTopPixels;
                };
                this._formOffsetLeftPixels = function () {
                    return formOffsetLeftPixels;
                };
                this._formOffsetTopPixels = function () {
                    return formOffsetTopPixels;
                };


                function cache(key, updatedContent) {
                    var pathToContent;
                    if (updatedContent) {
                        pathToContent = key.split('.');
                        var resolvedContent = cachedContent;
                        for (var i = 0; i < pathToContent.length - 1; i++) {
                            if (!resolvedContent[pathToContent[i]]) {
                                var nextObject = {};
                                nextObject[pathToContent[i + 1]] = undefined;
                                resolvedContent[pathToContent[i]] = nextObject;
                            }
                            // Point to the next level down.  Final iteration results in the contents
                            resolvedContent = resolvedContent[pathToContent[i]];
                        }
                        resolvedContent[pathToContent[pathToContent.length - 1]] = updatedContent;
                    } else {
                        pathToContent = key.split('.');
                        resolvedContent = cachedContent;
                        for (var i = 0; i < pathToContent.length; i++) {
                            // Point to the next level down.  Final iteration results in the contents
                            resolvedContent = resolvedContent[pathToContent[i]];
                            if (!resolvedContent) {
                                break;
                            }
                        }
                        if (resolvedContent && typeof resolvedContent === 'string') {
                            return resolvedContent;
                        } else {
                            return undefined;
                        }
                    }
                }
            }


            this.$get = ['$q', '$http', '$timeout', function ($q, $http, $timeout) {
                return new JopierService($q, $http, $timeout);
            }];
        }
    )
        // ================
        // Jopier Directive
        // ================
        .
        directive('jopier', ['$compile', '$jopier', '$interpolate', function ($compile, $jopier, $interpolate) {
            return {
                // TODO:  change copy of an attribute (img src or translate attribute)
                // TODO:  change copy of an expression, not of the expression itself
                restrict: 'A',
                priority: 10,
                scope: {
                    key: "@"
                },
                link: function (scope, element, attrs) {
                    var button,
                        form;

                    scope.attachTo = element;
                    // Remember the "key" which is the content
                    if (scope.key === undefined || scope.key === '') {
                        scope.key = element.html();
                    }
                    if (/^[{]{2}.+[}]{2}$/i.test(scope.key)) {
                        console.log('matches');
                        scope.key = $interpolate(scope.key)(scope.$parent);
                    }
                    if (!/^([a-z0-9]+\.)*[a-z0-9]+$/i.test(scope.key)) {
                        scope.key = 'BAD_KEY';
                    }

                    // Now for the magic; set the contet...
                    $jopier.content(scope.key).then(
                        function (content) {
                            element.html(content);
                        },
                        function (err) {
                            console.log(err);
                            element.html('Error loading content for key (see console logs): ' + key);
                        }
                    );

                    var deregisterHide = scope.$on('jopier-hide', function () {
                        element.removeClass('jopier-target');
                        scope.renderButton = false;
                        scope.renderForm = false;
                    });

                    var deregisterShow = scope.$on('jopier-show', function () {
                        createButton();
                        element.addClass('jopier-target');
                        scope.renderButton = true;
                    });

                    function createButton() {
                        if (!button) {
                            button = $($jopier._buttonTemplate());
                            var linkFunction = $compile(button);
                            $('body').append(linkFunction(scope));
                        }
                    }

                    scope.showForm = function () {
                        if (!form) {
                            form = $($jopier._formTemplate());
                            var linkFunction = $compile(form);
                            $('body').append(linkFunction(scope));
                        }
                        scope.content = '...loading';
                        scope.renderForm = true;
                        $jopier.content(scope.key).then(
                            function (content) {
                                scope.content = content;
                            },
                            function (err) {
                                scope.content = 'Error getting content, check console log: ' + err.message;
                                console.error(err);
                                alert(scope.content);
                            }
                        )
                    };

                    element.on('$destroy', function () {
                        deregisterHide();
                        deregisterShow();
                    });
                }
            };
        }])
        // =======================
        // Jopier Button Directive
        // =======================
        .directive('jopierButton', ['$jopier', function ($jopier) {
            return {
                restrict: 'C',
                link: function (scope, element, attrs) {
                    element.mouseover(function () {
                        scope.attachTo.addClass('jopier-target-hover');
                    });
                    element.mouseleave(function () {
                        scope.attachTo.removeClass('jopier-target-hover');
                    });
                    element.on('$destroy', function () {
                        element.off('mouseover');
                        element.off('mouseleave');
                    });
                    var offsetRect = getOffsetRect(scope.attachTo);
                    element.css('left', (offsetRect.left + $jopier._buttonOffsetLeftPixels()) + 'px');
                    element.css('top', (offsetRect.top + $jopier._buttonOffsetTopPixels()) + 'px');

                    scope.editContent = function () {
                        scope.showForm();
                    };

                }
            };
        }])
        // =====================
        // Jopier Form Directive
        // =====================
        .directive('jopierForm', ['$jopier', function ($jopier) {
            return {
                restrict: 'C',
                link: function (scope, element, attrs) {

                    element.mouseover(function () {
                        scope.attachTo.addClass('jopier-target-hover');
                    });
                    element.mouseleave(function () {
                        scope.attachTo.removeClass('jopier-target-hover');
                    });


                    element.on('$destroy', function () {
                        element.off('mouseover');
                        element.off('mouseleave');
                    });

                    var offsetRect = getOffsetRect(scope.attachTo);
                    element.css('left', (offsetRect.left + $jopier._formOffsetLeftPixels()) + 'px');
                    element.css('top', (offsetRect.top + $jopier._formOffsetTopPixels()) + 'px');

                    scope.cancel = function () {
                        scope.content = '';
                        scope.renderForm = false;
                    };
                    scope.save = function () {
                        $jopier.content(scope.key, scope.content).then(
                            function () {
                                scope.attachTo.html(scope.content);
                                scope.content = '';
                                scope.renderForm = false;
                            },
                            function (err) {
                                scope.content = 'Error saving content, check console log: ' + err.message;
                                console.error(err);
                                alert(scope.content);
                            }
                        );
                    }
                }
            };
        }]);
})();
