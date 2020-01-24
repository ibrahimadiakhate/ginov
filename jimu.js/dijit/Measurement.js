// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.22/esri/copyright.txt for details.
//>>built
require({
    cache: {
        "dojo/debounce": function () {
            define([], function () {
                return function (k, m) {
                    var f;
                    return function () {
                        f && clearTimeout(f);
                        var g = this,
                            b = arguments;
                        f = setTimeout(function () {
                            k.apply(g, b)
                        }, m)
                    }
                }
            })
        },
        "dijit/Menu": function () {
            define("require dojo/_base/array dojo/_base/declare dojo/dom dojo/dom-attr dojo/dom-geometry dojo/dom-style dojo/keys dojo/_base/lang dojo/on dojo/sniff dojo/_base/window dojo/window ./popup ./DropDownMenu dojo/ready".split(" "), function (k, m, f, g, b, l, n, d, a, r, h, v, e, z, w, p) {
                h("dijit-legacy-requires") &&
                    p(0, function () {
                        k(["dijit/MenuItem", "dijit/PopupMenuItem", "dijit/CheckedMenuItem", "dijit/MenuSeparator"])
                    });
                return f("dijit.Menu", w, {
                    constructor: function () {
                        this._bindings = []
                    },
                    targetNodeIds: [],
                    selector: "",
                    contextMenuForWindow: !1,
                    leftClickToOpen: !1,
                    refocus: !0,
                    postCreate: function () {
                        this.contextMenuForWindow ? this.bindDomNode(this.ownerDocumentBody) : m.forEach(this.targetNodeIds, this.bindDomNode, this);
                        this.inherited(arguments)
                    },
                    _iframeContentWindow: function (a) {
                        return e.get(this._iframeContentDocument(a)) ||
                            this._iframeContentDocument(a).__parent__ || a.name && document.frames[a.name] || null
                    },
                    _iframeContentDocument: function (a) {
                        return a.contentDocument || a.contentWindow && a.contentWindow.document || a.name && document.frames[a.name] && document.frames[a.name].document || null
                    },
                    bindDomNode: function (p) {
                        p = g.byId(p, this.ownerDocument);
                        var e;
                        if ("iframe" == p.tagName.toLowerCase()) {
                            var h = p;
                            e = this._iframeContentWindow(h);
                            e = v.body(e.document)
                        } else e = p == v.body(this.ownerDocument) ? this.ownerDocument.documentElement : p;
                        var n = {
                            node: p,
                            iframe: h
                        };
                        b.set(p, "_dijitMenu" + this.id, this._bindings.push(n));
                        var f = a.hitch(this, function (a) {
                            var p = this.selector,
                                e = p ? function (a) {
                                    return r.selector(p, a)
                                } : function (a) {
                                    return a
                                },
                                b = this;
                            return [r(a, e(this.leftClickToOpen ? "click" : "contextmenu"), function (a) {
                                a.stopPropagation();
                                a.preventDefault();
                                (new Date).getTime() < b._lastKeyDown + 500 || b._scheduleOpen(this, h, {
                                    x: a.pageX,
                                    y: a.pageY
                                }, a.target)
                            }), r(a, e("keydown"), function (a) {
                                if (93 == a.keyCode || a.shiftKey && a.keyCode == d.F10 || b.leftClickToOpen && a.keyCode == d.SPACE) a.stopPropagation(),
                                    a.preventDefault(), b._scheduleOpen(this, h, null, a.target), b._lastKeyDown = (new Date).getTime()
                            })]
                        });
                        n.connects = e ? f(e) : [];
                        h && (n.onloadHandler = a.hitch(this, function () {
                            var a = this._iframeContentWindow(h),
                                a = v.body(a.document);
                            n.connects = f(a)
                        }), h.addEventListener ? h.addEventListener("load", n.onloadHandler, !1) : h.attachEvent("onload", n.onloadHandler))
                    },
                    unBindDomNode: function (a) {
                        var p;
                        try {
                            p = g.byId(a, this.ownerDocument)
                        } catch (I) {
                            return
                        }
                        a = "_dijitMenu" + this.id;
                        if (p && b.has(p, a)) {
                            for (var d = b.get(p, a) - 1, e = this._bindings[d],
                                    h; h = e.connects.pop();) h.remove();
                            (h = e.iframe) && (h.removeEventListener ? h.removeEventListener("load", e.onloadHandler, !1) : h.detachEvent("onload", e.onloadHandler));
                            b.remove(p, a);
                            delete this._bindings[d]
                        }
                    },
                    _scheduleOpen: function (a, p, d, e) {
                        this._openTimer || (this._openTimer = this.defer(function () {
                            delete this._openTimer;
                            this._openMyself({
                                target: e,
                                delegatedTarget: a,
                                iframe: p,
                                coords: d
                            })
                        }, 1))
                    },
                    _openMyself: function (a) {
                        function p() {
                            k.refocus && v && v.focus();
                            z.close(k)
                        }
                        var d = a.target,
                            e = a.iframe,
                            b = a.coords,
                            f = !b;
                        this.currentTarget =
                            a.delegatedTarget;
                        if (b) {
                            if (e) {
                                a = l.position(e, !0);
                                var d = this._iframeContentWindow(e),
                                    d = l.docScroll(d.document),
                                    r = n.getComputedStyle(e),
                                    w = n.toPixelValue,
                                    y = (h("ie") && h("quirks") ? 0 : w(e, r.paddingLeft)) + (h("ie") && h("quirks") ? w(e, r.borderLeftWidth) : 0),
                                    e = (h("ie") && h("quirks") ? 0 : w(e, r.paddingTop)) + (h("ie") && h("quirks") ? w(e, r.borderTopWidth) : 0);
                                b.x += a.x + y - d.x;
                                b.y += a.y + e - d.y
                            }
                        } else b = l.position(d, !0), b.x += 10, b.y += 10;
                        var k = this,
                            e = this._focusManager.get("prevNode");
                        a = this._focusManager.get("curNode");
                        var v = !a ||
                            g.isDescendant(a, this.domNode) ? e : a;
                        z.open({
                            popup: this,
                            x: b.x,
                            y: b.y,
                            onExecute: p,
                            onCancel: p,
                            orient: this.isLeftToRight() ? "L" : "R"
                        });
                        this.focus();
                        f || this.defer(function () {
                            this._cleanUp(!0)
                        });
                        this._onBlur = function () {
                            this.inherited("_onBlur", arguments);
                            z.close(this)
                        }
                    },
                    destroy: function () {
                        m.forEach(this._bindings, function (a) {
                            a && this.unBindDomNode(a.node)
                        }, this);
                        this.inherited(arguments)
                    }
                })
            })
        },
        "dijit/DropDownMenu": function () {
            define(["dojo/_base/declare", "dojo/keys", "dojo/text!./templates/Menu.html", "./_MenuBase"],
                function (k, m, f, g) {
                    return k("dijit.DropDownMenu", g, {
                        templateString: f,
                        baseClass: "dijitMenu",
                        _onUpArrow: function () {
                            this.focusPrev()
                        },
                        _onDownArrow: function () {
                            this.focusNext()
                        },
                        _onRightArrow: function (b) {
                            this._moveToPopup(b);
                            b.stopPropagation();
                            b.preventDefault()
                        },
                        _onLeftArrow: function (b) {
                            if (this.parentMenu)
                                if (this.parentMenu._isMenuBar) this.parentMenu.focusPrev();
                                else this.onCancel(!1);
                            else b.stopPropagation(), b.preventDefault()
                        }
                    })
                })
        },
        "dijit/_MenuBase": function () {
            define("dojo/_base/array dojo/_base/declare dojo/dom dojo/dom-attr dojo/dom-class dojo/_base/lang dojo/mouse dojo/on dojo/window ./a11yclick ./registry ./_Widget ./_CssStateMixin ./_KeyNavContainer ./_TemplatedMixin".split(" "),
                function (k, m, f, g, b, l, n, d, a, r, h, v, e, z, w) {
                    return m("dijit._MenuBase", [v, w, z, e], {
                        selected: null,
                        _setSelectedAttr: function (a) {
                            this.selected != a && (this.selected && (this.selected._setSelected(!1), this._onChildDeselect(this.selected)), a && a._setSelected(!0), this._set("selected", a))
                        },
                        activated: !1,
                        _setActivatedAttr: function (a) {
                            b.toggle(this.domNode, "dijitMenuActive", a);
                            b.toggle(this.domNode, "dijitMenuPassive", !a);
                            this._set("activated", a)
                        },
                        parentMenu: null,
                        popupDelay: 500,
                        passivePopupDelay: Infinity,
                        autoFocus: !1,
                        childSelector: function (a) {
                            var e = h.byNode(a);
                            return a.parentNode == this.containerNode && e && e.focus
                        },
                        postCreate: function () {
                            var a = this,
                                e = "string" == typeof this.childSelector ? this.childSelector : l.hitch(this, "childSelector");
                            this.own(d(this.containerNode, d.selector(e, n.enter), function () {
                                    a.onItemHover(h.byNode(this))
                                }), d(this.containerNode, d.selector(e, n.leave), function () {
                                    a.onItemUnhover(h.byNode(this))
                                }), d(this.containerNode, d.selector(e, r), function (e) {
                                    a.onItemClick(h.byNode(this), e);
                                    e.stopPropagation()
                                }),
                                d(this.containerNode, d.selector(e, "focusin"), function () {
                                    a._onItemFocus(h.byNode(this))
                                }));
                            this.inherited(arguments)
                        },
                        onKeyboardSearch: function (a, e, d, b) {
                            this.inherited(arguments);
                            if (a && (-1 == b || a.popup && 1 == b)) this.onItemClick(a, e)
                        },
                        _keyboardSearchCompare: function (a, e) {
                            return a.shortcutKey ? e == a.shortcutKey.toLowerCase() ? -1 : 0 : this.inherited(arguments) ? 1 : 0
                        },
                        onExecute: function () {},
                        onCancel: function () {},
                        _moveToPopup: function (a) {
                            if (this.focusedChild && this.focusedChild.popup && !this.focusedChild.disabled) this.onItemClick(this.focusedChild,
                                a);
                            else(a = this._getTopMenu()) && a._isMenuBar && a.focusNext()
                        },
                        _onPopupHover: function () {
                            this.set("selected", this.currentPopupItem);
                            this._stopPendingCloseTimer()
                        },
                        onItemHover: function (a) {
                            this.activated ? (this.set("selected", a), !a.popup || a.disabled || this.hover_timer || (this.hover_timer = this.defer(function () {
                                this._openItemPopup(a)
                            }, this.popupDelay))) : Infinity > this.passivePopupDelay && (this.passive_hover_timer && this.passive_hover_timer.remove(), this.passive_hover_timer = this.defer(function () {
                                this.onItemClick(a, {
                                    type: "click"
                                })
                            }, this.passivePopupDelay));
                            this._hoveredChild = a;
                            a._set("hovering", !0)
                        },
                        _onChildDeselect: function (a) {
                            this._stopPopupTimer();
                            this.currentPopupItem == a && (this._stopPendingCloseTimer(), this._pendingClose_timer = this.defer(function () {
                                this.currentPopupItem = this._pendingClose_timer = null;
                                a._closePopup()
                            }, this.popupDelay))
                        },
                        onItemUnhover: function (a) {
                            this._hoveredChild == a && (this._hoveredChild = null);
                            this.passive_hover_timer && (this.passive_hover_timer.remove(), this.passive_hover_timer = null);
                            a._set("hovering", !1)
                        },
                        _stopPopupTimer: function () {
                            this.hover_timer && (this.hover_timer = this.hover_timer.remove())
                        },
                        _stopPendingCloseTimer: function () {
                            this._pendingClose_timer && (this._pendingClose_timer = this._pendingClose_timer.remove())
                        },
                        _getTopMenu: function () {
                            for (var a = this; a.parentMenu; a = a.parentMenu);
                            return a
                        },
                        onItemClick: function (a, e) {
                            this.passive_hover_timer && this.passive_hover_timer.remove();
                            this.focusChild(a);
                            if (a.disabled) return !1;
                            if (a.popup) {
                                this.set("selected", a);
                                this.set("activated", !0);
                                var d = /^key/.test(e._origType ||
                                    e.type) || 0 == e.clientX && 0 == e.clientY;
                                this._openItemPopup(a, d)
                            } else this.onExecute(), a._onClick ? a._onClick(e) : a.onClick(e)
                        },
                        _openItemPopup: function (a, e) {
                            if (a != this.currentPopupItem) {
                                this.currentPopupItem && (this._stopPendingCloseTimer(), this.currentPopupItem._closePopup());
                                this._stopPopupTimer();
                                var b = a.popup;
                                b.parentMenu = this;
                                this.own(this._mouseoverHandle = d.once(b.domNode, "mouseover", l.hitch(this, "_onPopupHover")));
                                var h = this;
                                a._openPopup({
                                    parent: this,
                                    orient: this._orient || ["after", "before"],
                                    onCancel: function () {
                                        e &&
                                            h.focusChild(a);
                                        h._cleanUp()
                                    },
                                    onExecute: l.hitch(this, "_cleanUp", !0),
                                    onClose: function () {
                                        h._mouseoverHandle && (h._mouseoverHandle.remove(), delete h._mouseoverHandle)
                                    }
                                }, e);
                                this.currentPopupItem = a
                            }
                        },
                        onOpen: function () {
                            this.isShowingNow = !0;
                            this.set("activated", !0)
                        },
                        onClose: function () {
                            this.set("activated", !1);
                            this.set("selected", null);
                            this.isShowingNow = !1;
                            this.parentMenu = null
                        },
                        _closeChild: function () {
                            this._stopPopupTimer();
                            this.currentPopupItem && (this.focused && (g.set(this.selected.focusNode, "tabIndex", this.tabIndex),
                                this.selected.focusNode.focus()), this.currentPopupItem._closePopup(), this.currentPopupItem = null)
                        },
                        _onItemFocus: function (a) {
                            if (this._hoveredChild && this._hoveredChild != a) this.onItemUnhover(this._hoveredChild);
                            this.set("selected", a)
                        },
                        _onBlur: function () {
                            this._cleanUp(!0);
                            this.inherited(arguments)
                        },
                        _cleanUp: function (a) {
                            this._closeChild();
                            "undefined" == typeof this.isShowingNow && this.set("activated", !1);
                            a && this.set("selected", null)
                        }
                    })
                })
        },
        "dijit/_KeyNavContainer": function () {
            define("dojo/_base/array dojo/_base/declare dojo/dom-attr dojo/_base/kernel dojo/keys dojo/_base/lang ./registry ./_Container ./_FocusMixin ./_KeyNavMixin".split(" "),
                function (k, m, f, g, b, l, n, d, a, r) {
                    return m("dijit._KeyNavContainer", [a, r, d], {
                        connectKeyNavHandlers: function (a, d) {
                            var e = this._keyNavCodes = {},
                                h = l.hitch(this, "focusPrev"),
                                n = l.hitch(this, "focusNext");
                            k.forEach(a, function (a) {
                                e[a] = h
                            });
                            k.forEach(d, function (a) {
                                e[a] = n
                            });
                            e[b.HOME] = l.hitch(this, "focusFirstChild");
                            e[b.END] = l.hitch(this, "focusLastChild")
                        },
                        startupKeyNavChildren: function () {
                            g.deprecated("startupKeyNavChildren() call no longer needed", "", "2.0")
                        },
                        startup: function () {
                            this.inherited(arguments);
                            k.forEach(this.getChildren(),
                                l.hitch(this, "_startupChild"))
                        },
                        addChild: function (a, d) {
                            this.inherited(arguments);
                            this._startupChild(a)
                        },
                        _startupChild: function (a) {
                            a.set("tabIndex", "-1")
                        },
                        _getFirst: function () {
                            var a = this.getChildren();
                            return a.length ? a[0] : null
                        },
                        _getLast: function () {
                            var a = this.getChildren();
                            return a.length ? a[a.length - 1] : null
                        },
                        focusNext: function () {
                            this.focusChild(this._getNextFocusableChild(this.focusedChild, 1))
                        },
                        focusPrev: function () {
                            this.focusChild(this._getNextFocusableChild(this.focusedChild, -1), !0)
                        },
                        childSelector: function (a) {
                            return (a =
                                n.byNode(a)) && a.getParent() == this
                        }
                    })
                })
        },
        "dijit/_KeyNavMixin": function () {
            define("dojo/_base/array dojo/_base/declare dojo/dom-attr dojo/keys dojo/_base/lang dojo/on dijit/registry dijit/_FocusMixin".split(" "), function (k, m, f, g, b, l, n, d) {
                return m("dijit._KeyNavMixin", d, {
                    tabIndex: "0",
                    childSelector: null,
                    postCreate: function () {
                        this.inherited(arguments);
                        f.set(this.domNode, "tabIndex", this.tabIndex);
                        if (!this._keyNavCodes) {
                            var a = this._keyNavCodes = {};
                            a[g.HOME] = b.hitch(this, "focusFirstChild");
                            a[g.END] = b.hitch(this,
                                "focusLastChild");
                            a[this.isLeftToRight() ? g.LEFT_ARROW : g.RIGHT_ARROW] = b.hitch(this, "_onLeftArrow");
                            a[this.isLeftToRight() ? g.RIGHT_ARROW : g.LEFT_ARROW] = b.hitch(this, "_onRightArrow");
                            a[g.UP_ARROW] = b.hitch(this, "_onUpArrow");
                            a[g.DOWN_ARROW] = b.hitch(this, "_onDownArrow")
                        }
                        var d = this,
                            a = "string" == typeof this.childSelector ? this.childSelector : b.hitch(this, "childSelector");
                        this.own(l(this.domNode, "keypress", b.hitch(this, "_onContainerKeypress")), l(this.domNode, "keydown", b.hitch(this, "_onContainerKeydown")), l(this.domNode,
                            "focus", b.hitch(this, "_onContainerFocus")), l(this.containerNode, l.selector(a, "focusin"), function (a) {
                            d._onChildFocus(n.getEnclosingWidget(this), a)
                        }))
                    },
                    _onLeftArrow: function () {},
                    _onRightArrow: function () {},
                    _onUpArrow: function () {},
                    _onDownArrow: function () {},
                    focus: function () {
                        this.focusFirstChild()
                    },
                    _getFirstFocusableChild: function () {
                        return this._getNextFocusableChild(null, 1)
                    },
                    _getLastFocusableChild: function () {
                        return this._getNextFocusableChild(null, -1)
                    },
                    focusFirstChild: function () {
                        this.focusChild(this._getFirstFocusableChild())
                    },
                    focusLastChild: function () {
                        this.focusChild(this._getLastFocusableChild())
                    },
                    focusChild: function (a, d) {
                        a && (this.focusedChild && a !== this.focusedChild && this._onChildBlur(this.focusedChild), a.set("tabIndex", this.tabIndex), a.focus(d ? "end" : "start"))
                    },
                    _onContainerFocus: function (a) {
                        a.target !== this.domNode || this.focusedChild || this.focus()
                    },
                    _onFocus: function () {
                        f.set(this.domNode, "tabIndex", "-1");
                        this.inherited(arguments)
                    },
                    _onBlur: function (a) {
                        f.set(this.domNode, "tabIndex", this.tabIndex);
                        this.focusedChild && (this.focusedChild.set("tabIndex",
                            "-1"), this.lastFocusedChild = this.focusedChild, this._set("focusedChild", null));
                        this.inherited(arguments)
                    },
                    _onChildFocus: function (a) {
                        a && a != this.focusedChild && (this.focusedChild && !this.focusedChild._destroyed && this.focusedChild.set("tabIndex", "-1"), a.set("tabIndex", this.tabIndex), this.lastFocused = a, this._set("focusedChild", a))
                    },
                    _searchString: "",
                    multiCharSearchDuration: 1E3,
                    onKeyboardSearch: function (a, d, b, n) {
                        a && this.focusChild(a)
                    },
                    _keyboardSearchCompare: function (a, d) {
                        var b = a.domNode,
                            b = (a.label || (b.focusNode ?
                                b.focusNode.label : "") || b.innerText || b.textContent || "").replace(/^\s+/, "").substr(0, d.length).toLowerCase();
                        return d.length && b == d ? -1 : 0
                    },
                    _isFormElement: function (a) {
                        return "INPUT" === a.tagName || "TEXTAREA" === a.tagName || "SELECT" === a.tagName || "BUTTON" === a.tagName
                    },
                    _onContainerKeydown: function (a) {
                        if (!this._isFormElement(document.activeElement)) {
                            var d = this._keyNavCodes[a.keyCode];
                            d ? (d(a, this.focusedChild), a.stopPropagation(), a.preventDefault(), this._searchString = "") : a.keyCode != g.SPACE || !this._searchTimer ||
                                a.ctrlKey || a.altKey || a.metaKey || (a.stopImmediatePropagation(), a.preventDefault(), this._keyboardSearch(a, " "))
                        }
                    },
                    _onContainerKeypress: function (a) {
                        this._isFormElement(document.activeElement) || a.charCode <= g.SPACE || a.ctrlKey || a.altKey || a.metaKey || (a.preventDefault(), a.stopPropagation(), this._keyboardSearch(a, String.fromCharCode(a.charCode).toLowerCase()))
                    },
                    _keyboardSearch: function (a, d) {
                        var n = null,
                            f, e = 0;
                        b.hitch(this, function () {
                            this._searchTimer && this._searchTimer.remove();
                            this._searchString += d;
                            var a = /^(.)\1*$/.test(this._searchString) ?
                                1 : this._searchString.length;
                            f = this._searchString.substr(0, a);
                            this._searchTimer = this.defer(function () {
                                this._searchTimer = null;
                                this._searchString = ""
                            }, this.multiCharSearchDuration);
                            var b = this.focusedChild || null;
                            if (1 == a || !b)
                                if (b = this._getNextFocusableChild(b, 1), !b) return;
                            a = b;
                            do {
                                var h = this._keyboardSearchCompare(b, f);
                                h && 0 == e++ && (n = b);
                                if (-1 == h) {
                                    e = -1;
                                    break
                                }
                                b = this._getNextFocusableChild(b, 1)
                            } while (b && b != a)
                        })();
                        this.onKeyboardSearch(n, a, f, e)
                    },
                    _onChildBlur: function () {},
                    _getNextFocusableChild: function (a, d) {
                        var b =
                            a;
                        do {
                            if (a) a = this._getNext(a, d);
                            else if (a = this[0 < d ? "_getFirst" : "_getLast"](), !a) break;
                            if (null != a && a != b && a.isFocusable()) return a
                        } while (a != b);
                        return null
                    },
                    _getFirst: function () {
                        return null
                    },
                    _getLast: function () {
                        return null
                    },
                    _getNext: function (a, d) {
                        if (a)
                            for (a = a.domNode; a;)
                                if ((a = a[0 > d ? "previousSibling" : "nextSibling"]) && "getAttribute" in a) {
                                    var b = n.byNode(a);
                                    if (b) return b
                                }
                        return null
                    }
                })
            })
        },
        "dijit/MenuItem": function () {
            define("dojo/_base/declare dojo/dom dojo/dom-attr dojo/dom-class dojo/_base/kernel dojo/sniff dojo/_base/lang ./_Widget ./_TemplatedMixin ./_Contained ./_CssStateMixin dojo/text!./templates/MenuItem.html".split(" "),
                function (k, m, f, g, b, l, n, d, a, r, h, v) {
                    n = k("dijit.MenuItem" + (l("dojo-bidi") ? "_NoBidi" : ""), [d, a, r, h], {
                        templateString: v,
                        baseClass: "dijitMenuItem",
                        label: "",
                        _setLabelAttr: function (a) {
                            this._set("label", a);
                            var b = "",
                                d;
                            d = a.search(/{\S}/);
                            if (0 <= d) {
                                var b = a.charAt(d + 1),
                                    e = a.substr(0, d);
                                a = a.substr(d + 3);
                                d = e + b + a;
                                a = e + '\x3cspan class\x3d"dijitMenuItemShortcutKey"\x3e' + b + "\x3c/span\x3e" + a
                            } else d = a;
                            this.domNode.setAttribute("aria-label", d + " " + this.accelKey);
                            this.containerNode.innerHTML = a;
                            this._set("shortcutKey", b)
                        },
                        iconClass: "dijitNoIcon",
                        _setIconClassAttr: {
                            node: "iconNode",
                            type: "class"
                        },
                        accelKey: "",
                        disabled: !1,
                        _fillContent: function (a) {
                            !a || "label" in this.params || this._set("label", a.innerHTML)
                        },
                        buildRendering: function () {
                            this.inherited(arguments);
                            f.set(this.containerNode, "id", this.id + "_text");
                            this.accelKeyNode && f.set(this.accelKeyNode, "id", this.id + "_accel");
                            m.setSelectable(this.domNode, !1)
                        },
                        onClick: function () {},
                        focus: function () {
                            try {
                                8 == l("ie") && this.containerNode.focus(), this.focusNode.focus()
                            } catch (e) {}
                        },
                        _setSelected: function (a) {
                            g.toggle(this.domNode,
                                "dijitMenuItemSelected", a)
                        },
                        setLabel: function (a) {
                            b.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
                            this.set("label", a)
                        },
                        setDisabled: function (a) {
                            b.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
                            this.set("disabled", a)
                        },
                        _setDisabledAttr: function (a) {
                            this.focusNode.setAttribute("aria-disabled", a ? "true" : "false");
                            this._set("disabled", a)
                        },
                        _setAccelKeyAttr: function (a) {
                            this.accelKeyNode && (this.accelKeyNode.style.display =
                                a ? "" : "none", this.accelKeyNode.innerHTML = a, f.set(this.containerNode, "colSpan", a ? "1" : "2"));
                            this._set("accelKey", a)
                        }
                    });
                    l("dojo-bidi") && (n = k("dijit.MenuItem", n, {
                        _setLabelAttr: function (a) {
                            this.inherited(arguments);
                            "auto" === this.textDir && this.applyTextDir(this.textDirNode)
                        }
                    }));
                    return n
                })
        },
        "dijit/_Contained": function () {
            define(["dojo/_base/declare", "./registry"], function (k, m) {
                return k("dijit._Contained", null, {
                    _getSibling: function (f) {
                        var g = this.getParent();
                        return g && g._getSiblingOfChild && g._getSiblingOfChild(this,
                            "previous" == f ? -1 : 1) || null
                    },
                    getPreviousSibling: function () {
                        return this._getSibling("previous")
                    },
                    getNextSibling: function () {
                        return this._getSibling("next")
                    },
                    getIndexInParent: function () {
                        var f = this.getParent();
                        return f && f.getIndexOfChild ? f.getIndexOfChild(this) : -1
                    }
                })
            })
        },
        "esri/tasks/AreasAndLengthsParameters": function () {
            define("dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/json dojo/has ../kernel".split(" "), function (k, m, f, g, b, l) {
                k = k(null, {
                    declaredClass: "esri.tasks.AreasAndLengthsParameters",
                    polygons: null,
                    lengthUnit: null,
                    areaUnit: null,
                    calculationType: null,
                    toJson: function () {
                        var b = f.map(this.polygons, function (a) {
                                return a.toJson()
                            }),
                            d = {};
                        d.polygons = g.toJson(b);
                        b = this.polygons[0].spatialReference;
                        d.sr = b.wkid ? b.wkid : g.toJson(b.toJson());
                        this.lengthUnit && (d.lengthUnit = this.lengthUnit);
                        this.areaUnit && (m.isString(this.areaUnit) ? d.areaUnit = g.toJson({
                            areaUnit: this.areaUnit
                        }) : d.areaUnit = this.areaUnit);
                        this.calculationType && (d.calculationType = this.calculationType);
                        return d
                    }
                });
                b("extend-esri") && m.setObject("tasks.AreasAndLengthsParameters",
                    k, l);
                return k
            })
        },
        "esri/tasks/LengthsParameters": function () {
            define("dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/json dojo/has ../kernel".split(" "), function (k, m, f, g, b, l) {
                k = k(null, {
                    declaredClass: "esri.tasks.LengthsParameters",
                    polylines: null,
                    lengthUnit: null,
                    geodesic: null,
                    calculationType: null,
                    toJson: function () {
                        var b = f.map(this.polylines, function (a) {
                                return a.toJson()
                            }),
                            d = {};
                        d.polylines = g.toJson(b);
                        b = this.polylines[0].spatialReference;
                        d.sr = b.wkid ? b.wkid : g.toJson(b.toJson());
                        this.lengthUnit &&
                            (d.lengthUnit = this.lengthUnit);
                        this.geodesic && (d.geodesic = this.geodesic);
                        this.calculationType && (d.calculationType = this.calculationType);
                        return d
                    }
                });
                b("extend-esri") && m.setObject("tasks.LengthsParameters", k, l);
                return k
            })
        },
        "esri/numberUtils": function () {
            define(["dojo/has", "dojo/number", "dojo/i18n!dojo/cldr/nls/number", "./kernel"], function (k, m, f, g) {
                var b = function (b, d) {
                        return b - d
                    },
                    l = {
                        _reNumber: /^-?(\d+)(\.(\d+))?$/i,
                        getDigits: function (b) {
                            var d = String(b),
                                a = d.match(l._reNumber);
                            b = {
                                integer: 0,
                                fractional: 0
                            };
                            a && a[1] ? (b.integer = a[1].split("").length, b.fractional = a[3] ? a[3].split("").length : 0) : -1 < d.toLowerCase().indexOf("e") && (a = d.split("e"), d = a[0], a = a[1], d && a && (d = Number(d), a = Number(a), (b = 0 < a) || (a = Math.abs(a)), d = l.getDigits(d), b ? (d.integer += a, d.fractional = a > d.fractional ? 0 : d.fractional - a) : (d.fractional += a, d.integer = a > d.integer ? 1 : d.integer - a), b = d));
                            return b
                        },
                        getFixedNumbers: function (b, d) {
                            var a, f;
                            a = Number(b.toFixed(d));
                            a < b ? f = a + 1 / Math.pow(10, d) : (f = a, a -= 1 / Math.pow(10, d));
                            a = Number(a.toFixed(d));
                            f = Number(f.toFixed(d));
                            return [a, f]
                        },
                        getPctChange: function (b, d, a, f) {
                            var h = {
                                    prev: null,
                                    next: null
                                },
                                g;
                            null != a && (g = b - a, h.prev = Math.floor(Math.abs(100 * (d - a - g) / g)));
                            null != f && (g = f - b, h.next = Math.floor(Math.abs(100 * (f - d - g) / g)));
                            return h
                        },
                        round: function (f, d) {
                            var a = f.slice(0),
                                g, h, n, e, k, m, p, y, A, H = d && null != d.tolerance ? d.tolerance : 2,
                                t = d && d.indexes,
                                B = d && null != d.strictBounds ? d.strictBounds : !1;
                            if (t) t.sort(b);
                            else
                                for (t = [], m = 0; m < a.length; m++) t.push(m);
                            for (m = 0; m < t.length; m++)
                                if (A = t[m], g = a[A], h = 0 === A ? null : a[A - 1], n = A === a.length - 1 ? null : a[A + 1],
                                    e = l.getDigits(g), e = e.fractional) {
                                    p = 0;
                                    for (y = !1; p <= e && !y;) k = l.getFixedNumbers(g, p), k = B && 0 === m ? k[1] : k[0], y = l.hasMinimalChange(g, k, h, n, H), p++;
                                    y && (a[A] = k)
                                }
                            return a
                        },
                        hasMinimalChange: function (b, d, a, f, g) {
                            b = l.getPctChange(b, d, a, f);
                            d = null == b.prev || b.prev <= g;
                            a = null == b.next || b.next <= g;
                            return d && a || b.prev + b.next <= 2 * g
                        },
                        _reAllZeros: new RegExp("\\" + f.decimal + "0+$", "g"),
                        _reSomeZeros: RegExp("(\\d)0*$", "g"),
                        format: function (b, d) {
                            d = d || {
                                places: 20,
                                round: -1
                            };
                            var a = m.format(b, d);
                            a && (a = a.replace(l._reSomeZeros, "$1").replace(l._reAllZeros,
                                ""));
                            return a
                        }
                    };
                k("extend-esri") && (g.numberUtils = l);
                return l
            })
        },
        "url:dijit/templates/Menu.html": '\x3ctable class\x3d"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable" role\x3d"menu" tabIndex\x3d"${tabIndex}"\r\n\t   cellspacing\x3d"0"\x3e\r\n\t\x3ctbody class\x3d"dijitReset" data-dojo-attach-point\x3d"containerNode"\x3e\x3c/tbody\x3e\r\n\x3c/table\x3e\r\n',
        "url:dijit/templates/MenuItem.html": '\x3ctr class\x3d"dijitReset" data-dojo-attach-point\x3d"focusNode" role\x3d"menuitem" tabIndex\x3d"-1"\x3e\r\n\t\x3ctd class\x3d"dijitReset dijitMenuItemIconCell" role\x3d"presentation"\x3e\r\n\t\t\x3cspan role\x3d"presentation" class\x3d"dijitInline dijitIcon dijitMenuItemIcon" data-dojo-attach-point\x3d"iconNode"\x3e\x3c/span\x3e\r\n\t\x3c/td\x3e\r\n\t\x3ctd class\x3d"dijitReset dijitMenuItemLabel" colspan\x3d"2" data-dojo-attach-point\x3d"containerNode,textDirNode"\r\n\t\trole\x3d"presentation"\x3e\x3c/td\x3e\r\n\t\x3ctd class\x3d"dijitReset dijitMenuItemAccelKey" style\x3d"display: none" data-dojo-attach-point\x3d"accelKeyNode"\x3e\x3c/td\x3e\r\n\t\x3ctd class\x3d"dijitReset dijitMenuArrowCell" role\x3d"presentation"\x3e\r\n\t\t\x3cspan data-dojo-attach-point\x3d"arrowWrapper" style\x3d"visibility: hidden"\x3e\r\n\t\t\t\x3cspan class\x3d"dijitInline dijitIcon dijitMenuExpand"\x3e\x3c/span\x3e\r\n\t\t\t\x3cspan class\x3d"dijitMenuExpandA11y"\x3e+\x3c/span\x3e\r\n\t\t\x3c/span\x3e\r\n\t\x3c/td\x3e\r\n\x3c/tr\x3e\r\n',
        "url:esri/dijit/templates/Measurement.html": "\x3cdiv class\x3d\"esriMeasurement\"\x3e\r\n  \x3cdiv dojoType\x3d'dijit.layout.ContentPane' class\x3d'esriMeasurementButtonContainer'\x3e\r\n    \x3cdiv dojoType\x3d'dijit.form.ToggleButton' baseClass\x3d'esriButton' dojoAttachPoint\x3d'_areaButton' iconClass\x3d'areaIcon' showLabel\x3d'false' dojoAttachEvent\x3d'onClick:_areaButtonToggle'\x3e\x3c/div\x3e\r\n    \x3cdiv dojoType\x3d'dijit.form.ToggleButton' baseClass\x3d'esriButton' dojoAttachPoint\x3d'_distanceButton' iconClass\x3d'distanceIcon' showLabel\x3d'false' dojoAttachEvent\x3d'onClick:_distanceButtonToggle'\x3e\x3c/div\x3e\r\n    \x3cdiv dojoType\x3d'dijit.form.ToggleButton' baseClass\x3d'esriButton' dojoAttachPoint\x3d'_locationButton' iconClass\x3d'locationIcon' showLabel\x3d'false' dojoAttachEvent\x3d'onClick:_locationButtonToggle'\x3e\x3c/div\x3e\r\n    \x3cdiv class\x3d\"esriMeasurementSeparator\"\x3e|\x3c/div\x3e\r\n    \x3cbutton dojoType\x3d'dijit.form.DropDownButton' baseClass\x3d'esriToggleButton' dojoAttachPoint\x3d'_unitDropDown' label\x3d'unit' value\x3d'unit' style\x3d'visibility:hidden;'\x3e\x3c/button\x3e\r\n  \x3c/div\x3e\r\n  \x3cdiv dojoType\x3d'dijit.layout.ContentPane' dojoAttachPoint\x3d'resultLabel' class\x3d'resultLabel esriMeasurementResultLabel'\x3e\x3c/div\x3e\r\n  \x3cdiv dojoType\x3d'dijit.layout.ContentPane' dojoAttachPoint\x3d'resultValueContainer' align\x3d'leading' class\x3d\"esriMeasurementResultValue\"\x3e\r\n    \x3cdiv dojoType\x3d'dijit.layout.ContentPane' dojoAttachPoint\x3d'resultValue' class\x3d'result'\x3e\x26nbsp;\x3c/div\x3e\r\n  \x3c/div\x3e\r\n  \x3cdiv dojoType\x3d'dijit.layout.ContentPane' dojoAttachPoint\x3d'resultTable' align\x3d'leading' class\x3d\"resultTable esriMeasurementTableContainer\" style\x3d\"display:none;\"\x3e\r\n    \x3ctable class\x3d\"esriMeasurementResultTable\"\x3e\r\n      \x3ctr\x3e\r\n        \x3ctd class\x3d\"esriMeasurementTableHeader\" colspan\x3d\"2\"\x3e${_NLS_Lat}\x3c/td\x3e\x3ctd class\x3d\"esriMeasurementTableHeader\"\x3e${_NLS_Lon}\x3c/td\x3e\r\n      \x3c/tr\x3e\r\n      \x3ctr class\x3d\"esriMeasurementTableRow\" dojoAttachPoint\x3d\"_mouseRow\"\x3e\r\n        \x3ctd dojoAttachPoint\x3d\"mouseCell\"\x3e\x3c/td\x3e\r\n        \x3ctd class\x3d\"esriMeasurementTableCell\"\x3e\r\n          \x3cspan dojoAttachPoint\x3d\"mouseLatitude\" dir\x3d'ltr'\x3e\x3c/span\x3e\r\n        \x3c/td\x3e\r\n        \x3ctd class\x3d\"esriMeasurementTableCell\"\x3e\r\n          \x3cspan dojoAttachPoint\x3d\"mouseLongitude\" dir\x3d'ltr'\x3e\x3c/span\x3e\r\n        \x3c/td\x3e\r\n      \x3c/tr\x3e\r\n      \x3ctr class\x3d\"esriMeasurementTableRow\"\x3e\r\n        \x3ctd dojoAttachPoint\x3d\"pinCell\"\x3e\x3c/td\x3e\r\n        \x3ctd class\x3d\"esriMeasurementTableCell\"\x3e\r\n          \x3cspan dojoAttachPoint\x3d\"markerLatitude\" dir\x3d'ltr'\x3e\x3c/span\x3e\r\n        \x3c/td\x3e\r\n        \x3ctd class\x3d\"esriMeasurementTableCell\"\x3e\r\n          \x3cspan dojoAttachPoint\x3d\"markerLongitude\" dir\x3d'ltr'\x3e\x3c/span\x3e\r\n        \x3c/td\x3e\r\n      \x3c/tr\x3e\r\n    \x3c/table\x3e\r\n  \x3c/div\x3e\r\n\x3c/div\x3e",
        "*noref": 1
    }
});
define("jimu/dijit/Measurement", "require dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/connect dojo/_base/Color dojo/debounce dojo/sniff dojo/dom-style dojo/dom-construct dojox/gfx dijit/_Widget dijit/registry dijit/Menu dijit/MenuItem esri/symbols/PictureMarkerSymbol esri/symbols/SimpleLineSymbol esri/symbols/SimpleFillSymbol esri/symbols/jsonUtils esri/geometry/geodesicUtils esri/geometry/webMercatorUtils esri/geometry/Point esri/geometry/Polyline esri/geometry/Polygon esri/graphic esri/tasks/AreasAndLengthsParameters esri/tasks/LengthsParameters esri/tasks/GeometryService esri/kernel esri/config esri/domUtils esri/numberUtils esri/lang esri/units esri/WKIDUnitConversion esri/SpatialReference dijit/_TemplatedMixin dijit/_WidgetsInTemplateMixin esri/dijit/_EventedWidget dojo/text!./templates/Measurement.html dojo/i18n!esri/nls/jsapi dijit/form/ToggleButton dijit/form/DropDownButton dijit/layout/ContentPane".split(" "), function (k,
    m, f, g, b, l, n, d, a, r, h, v, e, z, w, p, y, A, H, t, B, I, x, G, u, K, L, M, N, O, D, E, P, F, Q, J, R, S, T, U, C) {
    m = m([T, v, R, S], {
        declaredClass: "esri.dijit.Measurement",
        widgetsInTemplate: !0,
        templateString: U,
        _map: null,
        _geometryService: null,
        _interpolatedMap: null,
        _mouseImgURL: null,
        _defaultPinURL: null,
        _measureGraphics: [],
        _measureGraphic: null,
        _locationGraphic: null,
        _tempGraphic: null,
        _polylineGraphics: null,
        _polygonGraphic: null,
        _pointSymbol: null,
        _useDefaultPointSymbol: !0,
        _defaultLineSymbol: null,
        _lineSymbol: null,
        _areaLineSymbol: null,
        _defaultFillSymbol: null,
        _fillSymbol: null,
        _borderlessFillSymbol: null,
        _defaultCustomPointSymbolHeight: 25,
        _defaultCustomPointSymbolWidth: 25,
        _userGeometry: null,
        _currentGeometry: null,
        _inputPoints: [],
        _unitDictionary: [],
        _densificationRatio: .07848050723825097,
        numberPattern: "#,###,###,##0.0",
        result: null,
        _defaultDistanceUnit: null,
        _defaultAreaUnit: null,
        _defaultLocationUnit: null,
        currentDistanceUnit: null,
        currentAreaUnit: null,
        currentLocationUnit: null,
        _unitStrings: {},
        _locationUnitStrings: [],
        _locationUnitStringsLong: [],
        _distanceUnitStrings: [],
        _distanceUnitStringsLong: [],
        _areaUnitStrings: [],
        _areaUnitStringsLong: [],
        _calculatingMsg: null,
        _gsErrorMsg: null,
        _NLS_Lat: null,
        _NLS_Lon: null,
        _mouseMoveMapHandler: null,
        _mouseClickMapHandler: null,
        _doubleClickMapHandler: null,
        _mouseDragMapHandler: null,
        _clickMapHandler: null,
        _mapExtentChangeHandler: null,
        _geometryAreaHandler: null,
        _snappingCallback: null,
        _calcTimer: null,
        _buttonDijits: {},
        previousTool: null,
        activeTool: null,
        markerLongitude: null,
        markerLatitude: null,
        mouseLongitude: null,
        mouseLatitude: null,
        _eventMap: {
            "measure-start": ["toolName",
                "unitName"
            ],
            measure: ["toolName", "geometry", "values", "unitName", "segmentLength"],
            "measure-end": ["toolName", "geometry", "values", "unitName"],
            "tool-change": ["toolName", "unitName", "previousToolName"],
            "unit-change": ["unitName", "toolName"]
        },
        constructor: function (c, a) {
            if (c && c.map) {
                this._map = c.map;
                if (this._map.loaded) this._map.cs = this._checkCS(this._map.spatialReference), this._interpolatedMap = !("Web Mercator" === this._map.cs || "PCS" === this._map.cs);
                else var q = b.connect(this._map, "onLoad", this, function () {
                    b.disconnect(q);
                    q = null;
                    this._map.cs = this._checkCS(this._map.spatialReference);
                    this._interpolatedMap = !("Web Mercator" === this._map.cs || "PCS" === this._map.cs)
                });
                this._geometryService = O.defaults.geometryService;
                this._mouseImgURL = k.toUrl("./images/cursor16x24.png");
                this._defaultPinURL = k.toUrl("./images/esriGreenPin16x26.png");
                this._defaultLineSymbol = new y(y.STYLE_SOLID, new l([0, 128, 255]), 3);
                this._defaultFillSymbol = new A(y.STYLE_SOLID, this._defaultLineSymbol, new l([0, 0, 0, .5]));
                c.pointSymbol ? (this._pointSymbol = c.pointSymbol,
                    this._useDefaultPointSymbol = !1) : (this._pointSymbol = new p(this._defaultPinURL, 16, 26), this._pointSymbol.setOffset(0, 12));
                var d = c.fillSymbol || this._defaultFillSymbol;
                this._fillSymbol = d;
                this._areaLineSymbol = d.outline || this._defaultLineSymbol;
                this._borderlessFillSymbol = H.fromJson(d.toJson());
                this._borderlessFillSymbol.setOutline(null);
                this._lineSymbol = c.lineSymbol ? c.lineSymbol : this._defaultLineSymbol;
                this._defaultDistanceUnit = c.defaultLengthUnit ? c.defaultLengthUnit : F.MILES;
                this._defaultAreaUnit = c.defaultAreaUnit ?
                    c.defaultAreaUnit : F.ACRES;
                this._defaultLocationUnit = c.defaultLocationUnit ? c.defaultLocationUnit : F.DECIMAL_DEGREES;
                this._snappingCallback = f.hitch(this, this._snappingCallback);
                c.geometry && (this._userGeometry = c.geometry);
                this._calcTimer = null;
                this.advancedLocationUnits = c.advancedLocationUnits || !1;
                this._NLS_Lon = C.widgets.measurement.NLS_longitude;
                this._NLS_Lat = C.widgets.measurement.NLS_latitude;
                this._gsErrorMsg = C.widgets.measurement.NLS_geometry_service_error;
                this._calculatingMsg = C.widgets.measurement.NLS_calculating;
                this._geometryServiceLength = n(this._geometryServiceLength, 250)
            } else console.log("Unable to find the required 'map' property in widget parameters")
        },
        startup: function () {
            this._setupDictionaries();
            // r.create("img", {
            //     src: this._mouseImgURL,
            //     style: "vertical-align: middle"
            // }, this.mouseCell);
            this._useDefaultPointSymbol ? r.create("img", {
                src: this._defaultPinURL,
                style: "vertical-align: middle"
            }, this.pinCell) : this._drawPointGraphics(this.pinCell);
            if (this._userGeometry)
                if (this._map.loaded) this._measureCustomGeometry(this._userGeometry),
                    this._userGeometry = null;
                else var c = b.connect(this._map, "onLoad", this, function () {
                    b.disconnect(c);
                    c = null;
                    this._measureCustomGeometry(this._userGeometry);
                    this._userGeometry = null
                })
        },
        destroy: function () {
            this._resetToolState();
            this.clearResult();
            this.inherited(arguments);
            this._map = this._geometryService = this._measureGraphics = this._measureGraphic = this._tempGraphic = null
        },
        setTool: function (c, q) {
            this.previousTool = this.activeTool || null;
            this._polylineGraphics = [];
            this._resetToolState();
            this._polygonGraphic && (this._map.graphics.remove(this._polygonGraphic),
                this._polygonGraphic = null);
            var b = e.byNode(this._buttonDijits[c].domNode).checked;
            a.set(this._unitDropDown.domNode, "visibility", "visible");
            e.byNode(this._buttonDijits.area.domNode).set("checked", !1);
            e.byNode(this._buttonDijits.distance.domNode).set("checked", !1);
            e.byNode(this._buttonDijits.location.domNode).set("checked", !1);
            if (!0 === q || !1 === q) b = q;
            e.byNode(this._buttonDijits[c].domNode).set("checked", b);
            this._toggleLocationResultsTable(!1, !0);
            b ? (this.activeTool = c, (this._dblClickZoom = this._map.isDoubleClickZoom) &&
                this._map.disableDoubleClickZoom(), "area" === c ? this._setupAreaTool() : "distance" === c ? this._setupDistanceTool() : "location" === c && this._setupLocationTool(), this._map.snappingManager && (this._map.snappingManager._startSelectionLayerQuery(), this._map.snappingManager._setUpSnapping())) : (this.activeTool = null, a.set(this._unitDropDown.domNode, "visibility", "hidden"));
            if (this.activeTool !== this.previousTool) this.onToolChange(this.activeTool, this.getUnit(), this.previousTool)
        },
        measure: function (c) {
            c && this._measureCustomGeometry(c)
        },
        clearResult: function () {
            var c = this._map,
                a;
            this.result = 0;
            this.resultValue.setContent("\x26nbsp");
            for (a = 0; a < this._measureGraphics.length; a++) c.graphics.remove(this._measureGraphics[a]);
            this._measureGraphic = this._locationGraphic = this._currentGeometry = null;
            this._measureGraphics = [];
            c.graphics.remove(this._tempGraphic);
            b.disconnect(this._mouseMoveMapHandler);
            this._mouseMoveMapHandler = null
        },
        show: function () {
            D.show(this.domNode)
        },
        hide: function () {
            D.hide(this.domNode)
        },
        showTool: function (c) {
            a.set(this._buttonDijits[c].domNode,
                "display", "inline-block")
        },
        hideTool: function (c) {
            a.set(this._buttonDijits[c].domNode, "display", "none")
        },
        getTool: function () {
            if (this.activeTool) return {
                toolName: this.activeTool,
                unitName: this.getUnit()
            }
        },
        getUnit: function () {
            if ("unit" !== this._unitDropDown.label) return this._unitDropDown.label
        },
        _setupLocationTool: function () {
            this._map.navigationManager.setImmediateClick(!0);
            this._measureGraphics = [];
            this._map.graphics.remove(this._locationGraphic);
            this._createLocationUnitList();
            "PCS" === this._map.cs && (this._projectMapExtent(this._map.extent),
                this._mapExtentChangeHandler = b.connect(this._map, "onExtentChange", f.hitch(this, this._projectMapExtent)));
            this._clickMapHandler = b.connect(this._map, "onClick", this, "_locationClickHandler");
            if ("esriDegreeMinuteSeconds" === this.currentLocationUnit || "esriDecimalDegrees" === this.currentLocationUnit) this._mouseMoveMapHandler = b.connect(this._map, "onMouseMove", this, "_locationMoveHandler")
        },
        _locationButtonToggle: function () {
            this.clearResult();
            this.setTool("location");
			document.getElementById("use_mesure").innerHTML = "Cliquer sur la carte.";
        },
        _measureCustomPoint: function (c) {
            this.setTool("location", !0);
            "Web Mercator" === this._map.cs && c.spatialReference !== this._map.spatialReference && (c = B.geographicToWebMercator(c));
            this._measureGraphic = new u;
            this._measureGraphic.setSymbol(this._pointSymbol);
            this._measureGraphic.setGeometry(c);
            this._measureGraphics.push(this._measureGraphic);
            this._map.graphics.add(this._measureGraphic);
            this._currentGeometry = c;


        },
        _calculateLocation: function (c, a) {

            var q = !("esriDegreeMinuteSeconds" === this.currentLocationUnit || "esriDecimalDegrees" === this.currentLocationUnit || "lambert1" === this.currentLocationUnit || "lambert2" === this.currentLocationUnit || "lambert93" === this.currentLocationUnit);
            q && this._mouseMoveMapHandler && (b.disconnect(this._mouseMoveMapHandler), this._mouseMoveMapHandler = null);
            var d = f.clone(c);
            if (a) {
                console.log("this.currentLocationUnit",this.currentLocationUnit);
                if (this.currentLocationUnit === "lambert93") {
                    console.log(c);
                    this._updateClickLocation(c.x.toFixed(2), c.y.toFixed(2));
                } else if (this.currentLocationUnit === "lambert1") {
					//revenir ici 
                   // this._updateClickLocation(c.x.toFixed(2), c.y.toFixed(2));
					
                    this._geometryService.project([c], new J({
                        wkid: 102110
                    }), f.hitch(this, function (c) {
                        console.log(c);
                        this._updateClickLocation(c[0].x.toFixed(2), c[0].y.toFixed(2));
                    }));
					
                } else if (this.currentLocationUnit === "lambert2") {
                    console.log(c);
                    this._geometryService.project([c], new J({
                        wkid: 27562
                    }), f.hitch(this, function (c) {
                        console.log(c);
                        this._updateClickLocation(c[0].x.toFixed(2), c[0].y.toFixed(2));
                    }));
                } else if(this.currentLocationUnit === "esriDegreeMinuteSeconds" || this.currentLocationUnit === "esriDecimalDegrees"){
                    this._projectLocation(d, q);
                }else {
                    
                    if ("Web Mercator" !== this.map.cs && this.map.spatialReference && 4326 !== this.map.spatialReference.wkid) {
                        this._projectLocation(d, q);
                        return
                    }
                    this._updateMarkerLocation(d.x, d.y)
                }
            }
            //d = this._getGCSLocation(d); this._advancedLocationDisplayHandler(d, q, a)
        },
        _projectLocation: function (c, a) {
            this._geometryService.project([c], new J({
                wkid: 4326
            }), f.hitch(this, function (c) {
                this._advancedLocationDisplayHandler(c[0],
                    a, !0)
            }), f.hitch(this, function (c) {
                console.log(this._gsErrorMsg, c)
            }))
        },
        _advancedLocationDisplayHandler: function (c, a, b) {
            a ? this._updateGeocoordinateStringLocation({
                coordinates: [
                    [c.x, c.y]
                ],
                sr: {
                    wkid: 4326
                },
                conversionType: this._unitStrings[this.currentLocationUnit]
            }, c) : (a = this._calculateXY(c.x, c.y), b ? (this._updateClickLocation(a[0], a[1]), this.onMeasureEnd(this.activeTool, c, [a[0], a[1]], this.getUnit())) : this._updateMouseLocation(a[0], a[1]))
        },
        _updateMarkerLocation: function (c, a) {
            this.markerLocationX = c;
            this.markerLocationY =
                a;
        },
        _updateMouseLocation: function (c, a) {
            this.mouseLongitude.innerHTML = c;
            this.mouseLatitude.innerHTML = a
        },
        _updateClickLocation: function (c, a) {
            // this._updateMouseLocation(c, a);
            this.markerLongitude.innerHTML = c;
            this.markerLatitude.innerHTML = a
        },
        _updateGeocoordinateStringLocation: function (c, a) {
            this.resultValue.setContent("\x26nbsp");
            this._geometryService.toGeoCoordinateString(c, f.hitch(this, function (c) {
                clearTimeout(this._calcTimer);
                c ? (this.resultValue.setContent(c[0]), this.onMeasureEnd(this.activeTool, a, c, this.getUnit())) :
                    (this.resultValue.setContent(this._gsErrorMsg), this.onMeasureEnd(this.activeTool, null, null, this.getUnit()))
            }));
            clearTimeout(this._calcTimer);
            this._calcTimer = setTimeout(f.hitch(this, function () {
                this.resultValue.setContent(this._calculatingMsg)
            }, 1E3))
        },
        _switchLocationUnit: function (c) {
            e.byNode(this._unitDropDown.domNode).set("label", this._unitStrings[c]);
            this.currentLocationUnit = c;
            b.disconnect(this._mouseMoveMapHandler);
            this._mouseMoveMapHandler = null;
            this.onUnitChange(this._unitStrings[c], this.activeTool);
            if ("esriDegreeMinuteSeconds" === c || "esriDecimalDegrees" === c || "lambert1" === c || "lambert2" === c || "lambert93" === c) this._mouseMoveMapHandler = b.connect(this._map, "onMouseMove", this, "_locationMoveHandler"), this._toggleLocationResultsTable(!0, !1), this._locationGraphic && this._calculateLocation(this._locationGraphic.geometry, !0);
            else if (this._toggleLocationResultsTable(!1, !1), null !== this.resultValue && (null !== this.markerLocationX || null !== this.markerLocationY) && this._locationGraphic) {
                var a = this._getGCSLocation(this._locationGraphic.geometry);
                this._updateGeocoordinateStringLocation({
                    coordinates: [
                        [a.x,
                            a.y
                        ]
                    ],
                    sr: {
                        wkid: 4326
                    },
                    conversionType: this._unitStrings[c]
                }, this._locationGraphic.geometry)
            }
        },
        _toggleLocationResultsTable: function (c, a) {
            a && (this.resultValue.setContent("\x26nbsp"), this.markerLongitude.innerHTML = "---", this.markerLatitude.innerHTML = "---"/*, this.mouseLongitude.innerHTML = "---", this.mouseLatitude.innerHTML = "---"*/);
            c ? (D.show(this.resultTable.domNode), D.hide(this.resultValueContainer.domNode)) : (D.hide(this.resultTable.domNode), D.show(this.resultValueContainer.domNode), b.disconnect(this._mouseMoveMapHandler));
            "PCS" === this._map.cs && D.hide(this._mouseRow)
        },
        _setupDistanceTool: function () {
            this._map.navigationManager.setImmediateClick(!0);
            "PCS" === this._map.cs && (this._projectMapExtent(this._map.extent), this._mapExtentChangeHandler = b.connect(this._map, "onExtentChange", this, "_projectMapExtent"));
            this._inputPoints = [];
            this._createDistanceUnitList();
            this._mouseClickMapHandler = b.connect(this._map, "onClick", this, "_measureDistanceMouseClickHandler");
            this._doubleClickMapHandler = b.connect(this._map, "onDblClick", this, "_measureDistanceDblClickHandler")
        },
        _distanceButtonToggle: function () {
            this.clearResult();
            this.setTool("distance");
			document.getElementById("use_mesure").innerHTML = "Cliquer sur la carte. Terminer par un double-clic.";
        },
        _measureCustomDistance: function (c) {
            if (1 < c.paths[0].length) {
                this.setTool("distance", !0);
                this._inputPoints = [];
                g.forEach(c.paths[0], f.hitch(this, function (a, b) {
                    this._inputPoints.push(a);
                    var d = new u(new I(a[0], a[1], c.spatialReference), this._pointSymbol);
                    this._measureGraphics.push(d);
                    this._map.graphics.add(d);
                    0 !== b && (this.result += this._geodesicDistance(a, c.paths[0][b - 1]))
                }));
                this._measureGraphic = new u;
                this._measureGraphic.setSymbol(this._lineSymbol);
                this._measureGraphics.push(this._measureGraphic);
                var a = this._densifyGeometry(c);
                this._measureGraphic.setGeometry(a);
                this._map.graphics.add(this._measureGraphic);
                this._inputPoints = [];
                a = this._outputResult(this.result, this.getUnit());
                this._currentGeometry = c;
                this.onMeasureEnd(this.activeTool, c, a, this.getUnit())
            }
        },
        _showDistance: function (c) {
            c && this._outputResult(c, e.byNode(this._unitDropDown.domNode).label)
        },
        _setupAreaTool: function () {
            this._map.navigationManager.setImmediateClick(!0);
            this._inputPoints = [];
            this._createAreaUnitList();
            this._tempGraphic = new u;
            this._tempGraphic.setSymbol(this._areaLineSymbol);
            this._tempGraphic.setGeometry(new x(this._map.spatialReference));
            this._map.graphics.add(this._tempGraphic);
            "PCS" === this._map.cs && (this._geometryAreaHandler = b.connect(this._geometryService, "onAreasAndLengthsComplete", this, "_outputArea"));
            this._mouseClickMapHandler = b.connect(this._map, "onClick", this, "_measureAreaMouseClickHandler");
            this._doubleClickMapHandler = b.connect(this._map, "onDblClick", this, "_measureAreaDblClickHandler")
        },
        _areaButtonToggle: function () {
            this.clearResult();
            this.setTool("area");
			document.getElementById("use_mesure").innerHTML = "Cliquer sur la carte. Terminer par un double-clic.";
        },
        _generatePolygonFromPaths: function () {
            var c = [];
            g.forEach(this._polylineGraphics, f.hitch(this, function (a) {
                g.forEach(a.geometry.paths, f.hitch(this, function (a) {
                    g.forEach(a, f.hitch(this, function (a) {
                        c.push(a)
                    }))
                }))
            }));
            c.push(c[0]);
            var a = new G(this._map.spatialReference);
            a.addRing(c);
            var a = this._densifyGeometry(a),
                b = new u;
            b.setGeometry(a);
            b.setSymbol(this._borderlessFillSymbol);
            this._measureGraphic = b;
            this._measureGraphics.push(b);
            return b
        },
        _getArea: function (a) {
            var c = [],
                b = new K;
            b.areaUnit = M.UNIT_SQUARE_METERS;
            b.calculationType = "geodesic";
            G.prototype.isSelfIntersecting(a) ? this._geometryService.simplify([a], f.hitch(this, function (a) {
                g.forEach(a, f.hitch(this, function (d) {
                    "PCS" === this._map.cs ? (b.polygons = a, this._geometryService.areasAndLengths(b)) : ("Web Mercator" === this._map.cs && (d = B.webMercatorToGeographic(d)), c.push(d))
                }));
                var d = t.geodesicAreas(c, F.SQUARE_METERS);
                this._showArea(d[0])
            })) : ("Web Mercator" === this._map.cs && (a = B.webMercatorToGeographic(a)),
                c.push(a), "PCS" === this._map.cs ? (b.polygons = c, this._geometryService.areasAndLengths(b)) : (a = t.geodesicAreas(c, F.SQUARE_METERS), this._showArea(Math.abs(a[0]))))
        },
        _outputArea: function (a) {
            this._showArea(Math.abs(a.areas[0]))
        },
        _showArea: function (a) {
            if (a)
                if (this.result = a, a = e.byNode(this._unitDropDown.domNode).label, a = this._outputResult(this.result, a), this._mouseMoveMapHandler) this.onMeasure(this.activeTool, this._currentGeometry, a, this.getUnit(), null);
                else this.onMeasureEnd(this.activeTool, this._currentGeometry,
                    a, this.getUnit())
        },
        _measureCustomArea: function (a) {
            this.setTool("area", !0);
            this._inputPoints = [];
            var c = this._densifyGeometry(a);
            this._currentGeometry = a;
            this._measureGraphic = new u;
            this._measureGraphic.setGeometry(c);
            this._measureGraphic.setSymbol(this._fillSymbol);
            this._measureGraphics.push(this._measureGraphic);
            this._map.graphics.add(this._measureGraphic);
            this._getArea(a);
            this._inputPoints = []
        },
        _resetToolState: function () {
            var a = this._map;
            a.navigationManager.setImmediateClick(!1);
            this._dblClickZoom && a.enableDoubleClickZoom();
            this._inputPoints = [];
            b.disconnect(this._mouseClickMapHandler);
            b.disconnect(this._mouseMoveMapHandler);
            b.disconnect(this._doubleClickMapHandler);
            b.disconnect(this._mouseDragMapHandler);
            b.disconnect(this._clickMapHandler);
            b.disconnect(this._mapExtentChangeHandler);
            b.disconnect(this._geometryAreaHandler);
            this._mouseClickMapHandler = this._mouseMoveMapHandler = this._doubleClickMapHandler = this._mouseDragMapHandler = this._clickMapHandler = this._mapExtentChangeHandler = this._geometryAreaHandler = null;
            a.snappingManager &&
                a.snappingManager._snappingGraphic && a.graphics.remove(a.snappingManager._snappingGraphic);
            this._map.snappingManager && (this._map.snappingManager._stopSelectionLayerQuery(), this._map.snappingManager._killOffSnapping());
            this._unitDropDown._opened && this._unitDropDown.closeDropDown()
        },
        _measureCustomGeometry: function (a) {
            this.clearResult();
            switch (a.type) {
                case "point":
                    this._measureCustomPoint(a);
                    break;
                case "polyline":
                    this._measureCustomDistance(a);
                    break;
                case "polygon":
                    this._measureCustomArea(a)
            }
        },
        _densifyGeometry: function (a) {
            var c =
                this._map.cs,
                b = t.getSpheroidInfo(a.spatialReference).radius * this._densificationRatio;
            "Web Mercator" === c ? (a = B.webMercatorToGeographic(a), b = t.geodesicDensify(a, b), b = B.geographicToWebMercator(b)) : b = "PCS" === c ? a : t.geodesicDensify(a, b);
            return b
        },
        _geodesicDistance: function (a, b) {
            var c = new x(this._map.spatialReference);
            "PCS" === this._map.cs && (a = this._getGCSLocation(a), b = this._getGCSLocation(b));
            c.addPath([a, b]);
            "Web Mercator" === this._map.cs && (c = B.webMercatorToGeographic(c));
            return t.geodesicLengths([c], F.METERS)[0]
        },
        _calculateXY: function (a, b) {
            var c = C.widgets.measurement,
                d = this._map.getScale(),
                q, e;
            if (this.getUnit() === c.NLS_decimal_degrees) e = 500 <= d ? 6 : 500 > d && 50 <= d ? 7 : 50 > d && 5 <= d ? 8 : 9, q = a.toFixed(e), this._map.spatialReference._isWrappable() || (q = this._roundX(q)), q = E.format(q), e = E.format(this._roundY(b.toFixed(e)));
            else if (this.getUnit() === c.NLS_deg_min_sec) {
                var f = c = !1,
                    g, h, k, l;
                e = 9E4 <= d ? 0 : 9E4 > d && 9E3 <= d ? 1 : 9E3 > d && 900 <= d ? 2 : 900 > d && 90 < d ? 3 : 4;
                0 > a && (c = !0, a = Math.abs(a));
                0 > b && (f = !0, b = Math.abs(b));
                b = this._roundY(b);
                this._map.spatialReference._isWrappable() ||
                    (a = this._roundX(a));
                g = Math.floor(b) + "\u00b0";
                q = Math.floor(a) + "\u00b0";
                h = Math.floor(this._getDegreeMinutes(b)) + "'";
                d = Math.floor(this._getDegreeMinutes(a)) + "'";
                k = E.format(this._getDegreeSeconds(b).toFixed(e)) + '"';
                l = E.format(this._getDegreeSeconds(a).toFixed(e)) + '"';
                e = g + h + k;
                q = q + d + l;
                c && (q = "-" + q);
                f && (e = "-" + e)
            }
            return [q, e]
        },
        _getDegreeMinutes: function (a) {
            return 60 * (a - Math.floor(a))
        },
        _getDegreeSeconds: function (a) {
            return 60 * (60 * (a - Math.floor(a)) - Math.floor(60 * (a - Math.floor(a))))
        },
        _roundY: function (a) {
            90 < a ? a =
                90 : -90 > a && (a = -90);
            return a
        },
        _roundX: function (a) {
            180 < a ? a = 180 : -180 > a && (a = -180);
            return a
        },
        _getGCSLocation: function (a) {
            a = f.clone(a);
            var c = this._map,
                b = c.extent,
                d = c._newExtent;
            "Web Mercator" === c.cs ? a = B.webMercatorToGeographic(a) : "PCS" === c.cs ? d && (a = new I((a.x - b.xmin) * Math.abs((d.xmax - d.xmin) / (b.xmax - b.xmin)) + d.xmin, (a.y - b.ymin) * Math.abs((d.ymax - d.ymin) / (b.ymax - b.ymin)) + d.ymin, c.spatialReference)) : a = a.normalize();
            return a
        },
        _projectMapExtent: function (a) {
            a = new u(a);
            var c = new J({
                wkid: 4326
            });
            this._geometryService.project([a.geometry],
                c, f.hitch(this, function (a) {
                    if (!this._mouseMoveMapHandler && "location" === this.activeTool) {
                        if ("esriDegreeMinuteSeconds" === this.currentLocationUnit || "esriDecimalDegrees" === this.currentLocationUnit) this._mouseMoveMapHandler = b.connect(this._map, "onMouseMove", f.hitch(this, this._locationMoveHandler));
                        this._mouseMoveMapHandler = b.connect(this._map, "onMouseMove", f.hitch(this, this._locationMoveHandler))
                    }
                    this._map._newExtent = a[0]
                }))
        },
        _checkCS: function (a) {
            if (a.wkid) return 3857 === a.wkid || 102100 === a.wkid || 102113 ===
                a.wkid ? "Web Mercator" : P.isDefined(Q[a.wkid]) ? "PCS" : "GCS";
            if (a.wkt) return -1 !== a.wkt.indexOf("WGS_1984_Web_Mercator") ? "Web Mercator" : 0 === a.wkt.indexOf("PROJCS") ? "PCS" : "GCS"
        },
        _switchUnit: function (a) {
            "distance" === this.activeTool ? this.currentDistanceUnit = a : "area" === this.activeTool ? this.currentAreaUnit = a : "location" === this.activeTool && (this.currentLocationUnit = a);
            e.byNode(this._unitDropDown.domNode).set("label", this._unitStrings[a]);
            if (null !== this.result) {
                var c = this._outputResult(this.result, this._unitStrings[a]);
                this.onUnitChange(this._unitStrings[a], this.activeTool);
                if (null !== this._currentGeometry || null !== this._measureGraphic)
                    if (a = this._currentGeometry || this._measureGraphic.geometry, this._mouseMoveMapHandler) this.onMeasure(this.activeTool, a, c, this.getUnit(), null);
                    else this.onMeasureEnd(this.activeTool, a, c, this.getUnit())
            }
        },
        _setupDictionaries: function () {
            var a = C.widgets.measurement;
            this._unitDictionary[a.NLS_length_meters] = 1;
            this._unitDictionary[a.NLS_length_kilometers] = 1E3;
            this._unitDictionary[a.NLS_length_feet] =
                .3048;
            this._unitDictionary[a.NLS_length_miles] = 1609.344;
            this._unitDictionary[a.NLS_length_yards] = .9144;
            this._unitDictionary[a.NLS_length_nautical_miles] = 1852;
            this._unitDictionary[a.NLS_length_miles_us] = 1609.347218694438;
            this._unitDictionary[a.NLS_length_feet_us] = .3048006096012192;
            this._unitDictionary[a.NLS_length_yards_us] = .9144018288036576;
            this._unitDictionary[a.NLS_area_sq_meters] = 1;
            this._unitDictionary[a.NLS_area_sq_kilometers] = 1E6;
            this._unitDictionary[a.NLS_area_sq_feet] = .09290304;
            this._unitDictionary[a.NLS_area_acres] =
                4046.8564224;
            this._unitDictionary[a.NLS_area_sq_miles] = 2589988.110336;
            this._unitDictionary[a.NLS_area_hectares] = 1E4;
            this._unitDictionary[a.NLS_area_sq_yards] = .83612736;
            this._unitDictionary[a.NLS_area_sq_nautical_miles] = 3429904;
            this._unitDictionary[a.NLS_area_acres_us] = 4046.872609874252;
            this._unitDictionary[a.NLS_area_sq_miles_us] = 2589998.470319522;
            this._unitDictionary[a.NLS_area_sq_feet_us] = .09290341161327487;
            this._unitDictionary[a.NLS_area_sq_yards_us] = .8361307045194736;
            this._unitStrings = {
                esriMiles: a.NLS_length_miles,
                esriKilometers: a.NLS_length_kilometers,
                esriFeet: a.NLS_length_feet,
                esriFeetUS: a.NLS_length_feet_us,
                esriMeters: a.NLS_length_meters,
                esriYards: a.NLS_length_yards,
                esriNauticalMiles: a.NLS_length_nautical_miles,
                esriMilesUS: a.NLS_length_miles_us,
                esriYardsUS: a.NLS_length_yards_us,
                esriAcres: a.NLS_area_acres,
                esriSquareMiles: a.NLS_area_sq_miles,
                esriSquareKilometers: a.NLS_area_sq_kilometers,
                esriHectares: a.NLS_area_hectares,
                esriSquareYards: a.NLS_area_sq_yards,
                esriSquareFeet: a.NLS_area_sq_feet,
                esriSquareFeetUS: a.NLS_area_sq_feet_us,
                esriSquareMeters: a.NLS_area_sq_meters,
                esriAcresUS: a.NLS_area_acres_us,
                esriSquareMilesUS: a.NLS_area_sq_miles_us,
                esriSquareYardsUS: a.NLS_area_sq_yards_us,
                esriSquareNauticalMiles: a.NLS_area_sq_nautical_miles,
                esriDecimalDegrees: a.NLS_decimal_degrees,
                esriDegreeMinuteSeconds: a.NLS_deg_min_sec,
                // esriMGRS: a.NLS_MGRS,
                // esriUSNG: a.NLS_USNG,
                esriUTM: a.NLS_UTM,
                esriGARS: a.NLS_GARS,
                esriGeoRef: a.NLS_GeoRef,
                esriDDM: a.NLS_DDM,
                esriDD: a.NLS_DD,
                lambert1: "Lambert 93",
                // lambert2: "Lambert 2",
                lambert93: "Lambert 93"
            };
            this._locationUnitStrings = [a.NLS_decimal_degrees, a.NLS_deg_min_sec, /*"Lambert 1", "Lambert 2",*/ "Lambert 93", /*a.NLS_MGRS,
                a.NLS_USNG, a.NLS_UTM, a.NLS_GeoRef, a.NLS_GARS*/
            ];
            this._locationUnitStringsLong = "esriDecimalDegrees esriDegreeMinuteSeconds lambert1 lambert2 lambert93 esriMGRS esriUSNG esriUTM esriGeoRef esriGARS".split(" ");
            this._distanceUnitStrings = [a.NLS_length_miles, a.NLS_length_kilometers, a.NLS_length_feet, a.NLS_length_feet_us, a.NLS_length_meters, a.NLS_length_yards, a.NLS_length_nautical_miles];
            this._distanceUnitStringsLong = "esriMiles esriKilometers esriFeet esriFeetUS esriMeters esriYards esriNauticalMiles".split(" ");
            this._areaUnitStrings = [a.NLS_area_acres, a.NLS_area_sq_miles, a.NLS_area_sq_kilometers, a.NLS_area_hectares, a.NLS_area_sq_yards, a.NLS_area_sq_feet, a.NLS_area_sq_feet_us, a.NLS_area_sq_meters];
            this._areaUnitStringsLong = "esriAcres esriSquareMiles esriSquareKilometers esriHectares esriSquareYards esriSquareFeet esriSquareFeetUS esriSquareMeters".split(" ");
            this._buttonDijits = {
                area: this._areaButton,
                distance: this._distanceButton,
                location: this._locationButton
            };
            e.byNode(this._distanceButton.domNode).setLabel(a.NLS_distance);
            e.byNode(this._areaButton.domNode).setLabel(a.NLS_area);
            e.byNode(this._locationButton.domNode).setLabel(a.NLS_location);
            e.byNode(this.resultLabel.domNode).setContent(a.NLS_resultLabel)
        },
        onToolChange: function () {},
        onUnitChange: function () {},
        onMeasureStart: function () {},
        onMeasure: function () {},
        onMeasureEnd: function () {},
        _measureAreaMouseClickHandler: function (a) {
            var c;
            this._map.snappingManager && (c = this._map.snappingManager._snappingPoint);
            c = c || a.mapPoint;
            this._inputPoints.push(c);
            this._currentStartPt = c;
            if (1 === this._inputPoints.length) {
                this._tempGraphic.setGeometry(new x(this._map.spatialReference));
                for (a = 0; a < this._measureGraphics.length; a++) this._map.graphics.remove(this._measureGraphics[a]);
                this._measureGraphics = [];
                this.result = 0;
                this._outputResult(this.result, C.widgets.measurement.NLS_area_sq_meters);
                this._mouseMoveMapHandler = b.connect(this._map, "onMouseMove", this, "_measureAreaMouseMoveHandler");
                this.onMeasureStart(this.activeTool, this.getUnit())
            }
            this._measureGraphic = new u;
            this._measureGraphic.setSymbol(this._areaLineSymbol);
            this._measureGraphics.push(this._measureGraphic);
            if (1 < this._inputPoints.length) {
                a =
                    new x(this._map.spatialReference);
                a.addPath([this._inputPoints[this._inputPoints.length - 2], c]);
                var d = new x(this._map.spatialReference);
                d.addPath([this._inputPoints[0], c]);
                c = this._densifyGeometry(a);
                d = this._densifyGeometry(d);
                this._tempGraphic.setGeometry(d);
                this._measureGraphic.setGeometry(c);
                this._map.graphics.add(this._measureGraphic);
                c = new u;
                c.setGeometry(a);
                this._polylineGraphics.push(c);
                if (2 < this._inputPoints.length) {
                    c = new G(this._map.spatialReference);
                    d = [];
                    for (a = 0; a < this._inputPoints.length; a++) d.push([this._inputPoints[a].x,
                        this._inputPoints[a].y
                    ]);
                    d.push([this._inputPoints[0].x, this._inputPoints[0].y]);
                    c.addRing(d);
                    this._currentGeometry = c;
                    this._polygonGraphic ? (this._map.graphics.remove(this._polygonGraphic), this._polylineGraphics.push(this._tempGraphic), this._polygonGraphic = this._generatePolygonFromPaths(), this._map.graphics.add(this._polygonGraphic), this._measureGraphic = this._polygonGraphic, this._polylineGraphics.pop()) : (this._polygonGraphic = this._generatePolygonFromPaths(), this._map.graphics.add(this._polygonGraphic));
                    this._getArea(c)
                }
            } else this._polygonGraphic && (this._map.graphics.remove(this._polygonGraphic), this._polygonGraphic = null)
        },
        _measureAreaMouseMoveHandler: function (a) {
            var c;
            if (0 < this._inputPoints.length) {
                var b = new x(this._map.spatialReference),
                    d;
                this._map.snappingManager && (d = this._map.snappingManager._snappingPoint);
                c = d || a.mapPoint;
                b.addPath([this._currentStartPt, c]);
                a = this._densifyGeometry(b);
                this._tempGraphic.setGeometry(a)
            }
            1 < this._inputPoints.length && (a = new x(this._map.spatialReference), a.addPath([c,
                this._inputPoints[0]
            ]), c = this._densifyGeometry(a), this._tempGraphic.setGeometry(this._tempGraphic.geometry.addPath(c.paths[0])))
        },
        _measureAreaDblClickHandler: function (a) {
            b.disconnect(this._mouseMoveMapHandler);
            this._mouseMoveMapHandler = null;
            "touch" === this._map.navigationManager.eventModel && d("ios") && this._measureAreaMouseClickHandler(a);
            a = new G(this._map.spatialReference);
            var c = [],
                e;
            for (e = 0; e < this._inputPoints.length; e++) c.push([this._inputPoints[e].x, this._inputPoints[e].y]);
            c.push([this._inputPoints[0].x,
                this._inputPoints[0].y
            ]);
            a.addRing(c);
            this._inputPoints = [];
            this._currentGeometry = a;
            this._polygonGraphic && (this._map.graphics.remove(this._polygonGraphic), this._polylineGraphics.push(this._tempGraphic), this._polygonGraphic = this._generatePolygonFromPaths(), this._map.graphics.add(this._polygonGraphic));
            this._getArea(a);
            this._polylineGraphics = []
        },
        _measureDistanceMouseClickHandler: function (a) {
            var c;
            this._map.snappingManager && (c = this._map.snappingManager._snappingPoint);
            a = c || a.mapPoint;
            this._inputPoints.push(a);
            this._currentStartPt = a;
            if (1 === this._inputPoints.length) {
                for (c = 0; c < this._measureGraphics.length; c++) this._map.graphics.remove(this._measureGraphics[c]);
                this._map.graphics.remove(this._tempGraphic);
                this._measureGraphics = [];
                this.result = 0;
                this._outputResult(this.result, C.widgets.measurement.NLS_length_meters);
                this._tempGraphic = new u;
                this._tempGraphic.setSymbol(this._lineSymbol);
                this._map.graphics.add(this._tempGraphic);
                this._mouseMoveMapHandler = b.connect(this._map, "onMouseMove", this, "_measureDistanceMouseMoveHandler");
                this.onMeasureStart(this.activeTool, this.getUnit())
            }
            this._tempGraphic.setGeometry(new x(this._map.spatialReference));
            c = new u;
            c.setSymbol(this._pointSymbol);
            c.setGeometry(a);
            this._measureGraphics.push(c);
            this._map.graphics.add(c);
            if (1 < this._inputPoints.length) {
                this._measureGraphic = new u;
                this._measureGraphic.setSymbol(this._lineSymbol);
                this._measureGraphics.push(this._measureGraphic);
                c = new x(this._map.spatialReference);
                c.addPath([this._inputPoints[this._inputPoints.length - 2], a]);
                var d = this._densifyGeometry(c);
                this._measureGraphic.setGeometry(d);
                this._map.graphics.add(this._measureGraphic);
                "PCS" === this._map.cs ? this._geometryServiceLength(c, !1) : (d = this._geodesicDistance(this._inputPoints[this._inputPoints.length - 2], a), c = this._outputResult(d, this.getUnit()), this.result += d, this._showDistance(this.result), d = this._outputResult(this.result, this.getUnit()), this.onMeasure(this.activeTool, a, d, this.getUnit(), c))
            } else c.setSymbol(this._pointSymbol)
        },
        _measureDistanceMouseMoveHandler: function (a) {
            if (0 < this._inputPoints.length) {
                var c,
                    b = new x(this._map.spatialReference);
                this._map.snappingManager && (c = this._map.snappingManager._snappingPoint);
                a = c || a.mapPoint;
                b.addPath([this._currentStartPt, a]);
                b = this._densifyGeometry(b);
                this._tempGraphic.setGeometry(b);
                "PCS" !== this._map.cs && (c = this._geodesicDistance(this._currentStartPt, a), b = this._outputResult(c, this.getUnit()), c += this.result, this._showDistance(c), c = this._outputResult(c, this.getUnit()), this.onMeasure(this.activeTool, a, c, this.getUnit(), b))
            }
        },
        _measureDistanceDblClickHandler: function (a) {
            var c;
            b.disconnect(this._mouseMoveMapHandler);
            this._mouseMoveMapHandler = null;
            "touch" === this._map.navigationManager.eventModel && d("ios") && this._measureDistanceMouseClickHandler(a);
            a = new x(this._map.spatialReference);
            a.addPath(this._inputPoints);
            this._currentGeometry = a;
            c = this._densifyGeometry(a);
            this._measureGraphic.geometry = c;
            "PCS" === this._map.cs ? this._geometryServiceLength(a, !0) : (this._inputPoints = [], this.onMeasureEnd(this.activeTool, a, this._outputResult(this.result, this.getUnit()), this.getUnit()))
        },
        _geometryServiceLength: function (a,
            b) {
            var c = new L;
            c.polylines = [a];
            c.lengthUnit = 9001;
            c.calculationType = "geodesic";
            this._geometryService.lengths(c, f.hitch(this, function (c) {
                c = c.lengths[0];
                if (b) this.result = c, this._showDistance(this.result), this._inputPoints = [], this.onMeasureEnd(this.activeTool, a, this._outputResult(this.result, this.getUnit()), this.getUnit());
                else {
                    var d = this._outputResult(c, this.getUnit());
                    this.result += c;
                    this._showDistance(this.result);
                    this.onMeasure(this.activeTool, a, this._outputResult(this.result, this.getUnit()), this.getUnit(),
                        d)
                }
            }))
        },
        _locationClickHandler: function (a) {
            var c;
            this._map.snappingManager && (c = this._map.snappingManager._snappingPoint);
            a = c || a.mapPoint;
            this._locationButtonToggle();
            this._locationGraphic = new u;
            this._locationGraphic.setGeometry(a);
            this._locationGraphic.setSymbol(this._pointSymbol);
            this._map.graphics.add(this._locationGraphic);
            this._measureGraphics.push(this._locationGraphic);
            this._calculateLocation(a, !0)
        },
        _locationMoveHandler: function (a) {
            var c;
            this._map.snappingManager && (c = this._map.snappingManager._snappingPoint);
            this._calculateLocation(c || a.mapPoint, !1)
        },
        _outputResult: function (a, b) {
            var c = a / this._unitDictionary[b];
            0 === c ? this.resultValue.setContent("\x26nbsp") : 1E6 < c ? this.resultValue.setContent(E.format(c.toPrecision(9), {
                pattern: this.numberPattern
            }) + " " + b) : 10 > c ? this.resultValue.setContent(E.format(c.toFixed(2), {
                pattern: this.numberPattern + "0"
            }) + " " + b) : this.resultValue.setContent(E.format(c.toFixed(2), {
                pattern: this.numberPattern
            }) + " " + b);
            return c
        },
        _createDistanceUnitList: function () {
            var a, b = new z({
                style: "display: none;"
            });
            g.forEach(this._distanceUnitStrings, f.hitch(this, function (a, c) {
                var d = new w({
                    label: a,
                    onClick: f.hitch(this, function () {
                        this._switchUnit(this._distanceUnitStringsLong[c])
                    })
                });
                d.set("class", "unitDropDown");
                b.addChild(d)
            }));
            e.byNode(this._unitDropDown.domNode).set("dropDown", b);
            this.currentDistanceUnit ? (a = this._unitStrings[this.currentDistanceUnit], e.byNode(this._unitDropDown.domNode).set("label", a)) : (a = this._unitStrings[this._defaultDistanceUnit], e.byNode(this._unitDropDown.domNode).set("label", a), this.currentDistanceUnit =
                this._defaultDistanceUnit)
        },
        _createAreaUnitList: function () {
            var a, b = new z({
                style: "display: none;"
            });
            g.forEach(this._areaUnitStrings, f.hitch(this, function (a, c) {
                var d = new w({
                    label: a,
                    onClick: f.hitch(this, function () {
                        this._switchUnit(this._areaUnitStringsLong[c])
                    })
                });
                d.set("class", "unitDropDown");
                b.addChild(d)
            }));
            e.byNode(this._unitDropDown.domNode).set("dropDown", b);
            this.currentAreaUnit ? (a = this._unitStrings[this.currentAreaUnit], e.byNode(this._unitDropDown.domNode).set("label", a)) : (a = this._unitStrings[this._defaultAreaUnit],
                e.byNode(this._unitDropDown.domNode).set("label", a), this.currentAreaUnit = this._defaultAreaUnit)
        },
        _createLocationUnitList: function () {
            var a;
            a = this._locationUnitStrings;
            var b = new z({
                style: "display: none;"
            });
            if (null === this._geometryService || !1 === this.advancedLocationUnits) a = a.slice(0, 5);
            g.forEach(a, f.hitch(this, function (a, c) {
                var d = new w({
                    label: a,
                    onClick: f.hitch(this, function () {
                        this._switchLocationUnit(this._locationUnitStringsLong[c])
                    })
                });
                d.set("class", "unitDropDown");
                b.addChild(d)
            }));
            e.byNode(this._unitDropDown.domNode).set("dropDown",
                b);
            this.currentLocationUnit || (this.currentLocationUnit = this._defaultLocationUnit);
            a = this._unitStrings[this.currentLocationUnit];
            e.byNode(this._unitDropDown.domNode).set("label", a);
            "esriDegreeMinuteSeconds" !== this.currentLocationUnit && "esriDecimalDegrees" !== this.currentLocationUnit && "lambert1" !== this.currentLocationUnit && "lambert2" !== this.currentLocationUnit && "lambert93" !== this.currentLocationUnit || this._toggleLocationResultsTable(!0, !1)
        },
        _drawPointGraphics: function (b) {
            var c = this._pointSymbol,
                e = this._defaultCustomPointSymbolWidth,
                g = this._defaultCustomPointSymbolHeight,
                k, l;
            b = r.create("div", {
                    "class": "esriLocationResultSymbol"
                },
                b);
            b = h.createSurface(b, e, g);
            9 > d("ie") && (k = b.getEventSource(), a.set(k, "position", "relative"), a.set(k.parentNode, "position", "relative"));
            c = c.getShapeDescriptors();
            try {
                l = b.createShape(c.defaultShape).setFill(c.fill).setStroke(c.stroke)
            } catch (V) {
                b.clear();
                b.destroy();
                return
            }
            var m = l.getBoundingBox(),
                c = m.width;
            k = m.height;
            var n = -(m.x + c / 2),
                m = -(m.y + k / 2);
            b = b.getDimensions();
            b = {
                dx: n + b.width / 2,
                dy: m + b.height / 2
            };
            if (c > e || k > g) n = c / e > k / g, e = ((n ? e : g) - 5) / (n ? c : k), f.mixin(b, {
                xx: e,
                yy: e
            });
            l.applyTransform(b)
        }
    });
    d("extend-esri") &&
        f.setObject("dijit.Measurement", m, N);
    return m
});