/*! 
* DevExtreme (Common Widgets)
* Version: 15.1.3
* Build date: Jun 1, 2015
*
* Copyright (c) 2012 - 2015 Developer Express Inc. ALL RIGHTS RESERVED
* EULA: https://www.devexpress.com/Support/EULAs/DevExtreme.xml
*/

"use strict";
if (!DevExpress.MOD_WIDGETS_BASE) {
    if (!window.DevExpress)
        throw Error('Required module is not referenced: core');
    /*! Module widgets-base, file ui.errors.js */
    (function($, DX) {
        $.extend(DX.ERROR_MESSAGES, {
            E1001: "Module '{0}'. Controller '{1}' is already registered",
            E1002: "Module '{0}'. Controller '{1}' must be inheritor of DevExpress.ui.dxDataGrid.Controller",
            E1003: "Module '{0}'. View '{1}' is already registered",
            E1004: "Module '{0}'. View '{1}' must be inheritor of DevExpress.ui.dxDataGrid.View",
            E1005: "Public method '{0}' is already registered",
            E1006: "Public method '{0}.{1}' is not exists",
            E1007: "State storing can not be provided due to the restrictions of your browser",
            E1010: "A template should contain dxTextBox widget",
            E1011: "You have to implement 'remove' method in dataStore used by dxList to be able to delete items",
            E1012: "Editing type '{0}' with name '{1}' not supported",
            E1016: "Unexpected type of data source is provided for a lookup column",
            E1018: "The 'collapseAll' method cannot be called when using a remote data source",
            E1019: "Search mode '{0}' is unavailable",
            E1020: "Type can not be changed after initialization",
            E1021: "{0} '{1}' you are trying to remove does not exist",
            E1022: "Markers option should be an array",
            E1023: "Routes option should be an array",
            E1024: "Google provider cannot be used in WinJS application",
            E1025: "This layout is too complex to render",
            E1026: "The 'custom' value is set to a summary item's summaryType option, but a function for calculating the custom summary is not assigned to the grid's calculateCustomSummary option",
            E1030: "Unknown dxScrollView refresh strategy: '{0}'",
            E1031: "Unknown subscription is detected in the dxScheduler widget: '{0}'",
            E1032: "Unknown start date is detected in an appointment of the dxScheduler widget: '{0}'",
            E1033: "Unknown step is specified for the scheduler's navigator: '{0}'",
            E1034: "The current browser does not implement an API required for saving files",
            W1001: "Key option can not be modified after initialization",
            W1002: "Item '{0}' you are trying to select does not exist",
            W1003: "Group with key '{0}' in which you are trying to select items does not exist",
            W1004: "Item '{0}' you are trying to select in group '{1}' does not exist",
            W1005: "Due to column data types being unspecified, data has been loaded twice in order to apply initial filter settings. To resolve this issue, specify data types for all grid columns."
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SCROLLABLE = "dxScrollable",
            SCROLLABLE_STRATEGY = "dxScrollableStrategy",
            SCROLLABLE_CLASS = "dx-scrollable",
            SCROLLABLE_DISABLED_CLASS = "dx-scrollable-disabled",
            SCROLLABLE_CONTAINER_CLASS = "dx-scrollable-container",
            SCROLLABLE_CONTENT_CLASS = "dx-scrollable-content",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            BOTH = "both";
        var deviceDependentOptions = function() {
                return [{
                            device: function(device) {
                                return !DX.support.nativeScrolling
                            },
                            options: {useNative: false}
                        }, {
                            device: function(device) {
                                return !DX.support.nativeScrolling && !DX.devices.isSimulator() && DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {
                                bounceEnabled: false,
                                scrollByThumb: true,
                                scrollByContent: DX.support.touch,
                                showScrollbar: "onHover"
                            }
                        }]
            };
        DX.registerComponent(SCROLLABLE, ui, DX.DOMComponent.inherit({
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    updateAction: {
                        since: "14.2",
                        alias: "onUpdated"
                    },
                    scrollAction: {
                        since: "14.2",
                        alias: "onScroll"
                    },
                    startAction: {
                        since: "14.2",
                        alias: "onStart"
                    },
                    stopAction: {
                        since: "14.2",
                        alias: "onStop"
                    },
                    endAction: {
                        since: "14.2",
                        alias: "onEnd"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    disabled: false,
                    onScroll: null,
                    direction: VERTICAL,
                    showScrollbar: "onScroll",
                    useNative: true,
                    bounceEnabled: true,
                    scrollByContent: true,
                    scrollByThumb: false,
                    onUpdated: null,
                    onStart: null,
                    onEnd: null,
                    onBounce: null,
                    onStop: null,
                    useSimulatedScrollbar: false,
                    useKeyboard: true,
                    inertiaEnabled: true,
                    pushBackValue: 0
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat(deviceDependentOptions(), [{
                            device: function(device) {
                                return DX.support.nativeScrolling && DX.devices.real().platform === "android"
                            },
                            options: {useSimulatedScrollbar: true}
                        }, {
                            device: function(device) {
                                return DX.devices.real().platform === "ios"
                            },
                            options: {pushBackValue: 1}
                        }])
            },
            _initOptions: function(options) {
                this.callBase(options);
                if (!("useSimulatedScrollbar" in options))
                    this._setUseSimulatedScrollbar()
            },
            _setUseSimulatedScrollbar: function() {
                if (!this._initialOptions.useSimulatedScrollbar)
                    this.option("useSimulatedScrollbar", !this.option("useNative"))
            },
            _init: function() {
                this.callBase();
                this._initMarkup();
                this._attachNativeScrollbarsCustomizationCss();
                this._locked = false
            },
            _visibilityChanged: function(visible) {
                if (this.element().is(":hidden"))
                    return;
                if (visible) {
                    this.update();
                    this._toggleRTLDirection(this.option("rtlEnabled"));
                    this._savedScrollOffset && this.scrollTo(this._savedScrollOffset)
                }
                else
                    this._savedScrollOffset = this.scrollOffset()
            },
            _initMarkup: function() {
                var $element = this.element().addClass(SCROLLABLE_CLASS),
                    $container = this._$container = $("<div>").addClass(SCROLLABLE_CONTAINER_CLASS),
                    $content = this._$content = $("<div>").addClass(SCROLLABLE_CONTENT_CLASS);
                $content.append($element.contents()).appendTo($container);
                $container.appendTo($element)
            },
            _dimensionChanged: function() {
                this.update()
            },
            _attachNativeScrollbarsCustomizationCss: function() {
                if (!(navigator.platform.indexOf('Mac') > -1 && DevExpress.browser['webkit']))
                    this.element().addClass("dx-scrollable-customizable-scrollbars")
            },
            _render: function() {
                this._renderPushBackOffset();
                this._renderDirection();
                this._renderStrategy();
                this._attachEventHandlers();
                this._renderDisabledState();
                this._createActions();
                this.update();
                this.callBase()
            },
            _renderPushBackOffset: function() {
                var pushBackValue = this.option("pushBackValue");
                this._$content.css({
                    paddingTop: pushBackValue,
                    paddingBottom: pushBackValue
                })
            },
            _toggleRTLDirection: function(rtl) {
                this.callBase(rtl);
                if (rtl && this.option("direction") !== VERTICAL)
                    this.scrollTo({left: this.scrollWidth() - this.clientWidth()})
            },
            _attachEventHandlers: function() {
                var strategy = this._strategy;
                var initEventData = {
                        getDirection: $.proxy(strategy.getDirection, strategy),
                        validate: $.proxy(this._validate, this),
                        isNative: this.option("useNative")
                    };
                this._$container.off("." + SCROLLABLE).on(events.addNamespace("scroll", SCROLLABLE), $.proxy(strategy.handleScroll, strategy)).on(events.addNamespace("dxscrollinit", SCROLLABLE), initEventData, $.proxy(this._initHandler, this)).on(events.addNamespace("dxscrollstart", SCROLLABLE), $.proxy(strategy.handleStart, strategy)).on(events.addNamespace("dxscroll", SCROLLABLE), $.proxy(strategy.handleMove, strategy)).on(events.addNamespace("dxscrollend", SCROLLABLE), $.proxy(strategy.handleEnd, strategy)).on(events.addNamespace("dxscrollcancel", SCROLLABLE), $.proxy(strategy.handleCancel, strategy)).on(events.addNamespace("dxscrollstop", SCROLLABLE), $.proxy(strategy.handleStop, strategy))
            },
            _validate: function(e) {
                if (this._isLocked())
                    return false;
                this.update();
                return this._strategy.validate(e)
            },
            _initHandler: function() {
                var strategy = this._strategy;
                strategy.handleInit.apply(strategy, arguments)
            },
            _renderDisabledState: function() {
                this.element().toggleClass(SCROLLABLE_DISABLED_CLASS, this.option("disabled"));
                if (this.option("disabled"))
                    this._lock();
                else
                    this._unlock()
            },
            _renderDirection: function() {
                this.element().removeClass("dx-scrollable-" + HORIZONTAL).removeClass("dx-scrollable-" + VERTICAL).removeClass("dx-scrollable-" + BOTH).addClass("dx-scrollable-" + this.option("direction"))
            },
            _renderStrategy: function() {
                this._createStrategy();
                this._strategy.render();
                this.element().data(SCROLLABLE_STRATEGY, this._strategy)
            },
            _createStrategy: function() {
                this._strategy = this.option("useNative") ? new ui.dxScrollable.NativeStrategy(this) : new ui.dxScrollable.SimulatedStrategy(this)
            },
            _createActions: function() {
                this._strategy.createActions()
            },
            _clean: function() {
                this._strategy.dispose()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"onStart":
                    case"onEnd":
                    case"onStop":
                    case"onUpdated":
                    case"onScroll":
                    case"onBounce":
                        this._createActions();
                        break;
                    case"direction":
                        this._resetInactiveDirection();
                        this._invalidate();
                        break;
                    case"useNative":
                        this._setUseSimulatedScrollbar();
                        this._invalidate();
                        break;
                    case"inertiaEnabled":
                    case"bounceEnabled":
                    case"scrollByContent":
                    case"scrollByThumb":
                    case"bounceEnabled":
                    case"useKeyboard":
                    case"showScrollbar":
                    case"useSimulatedScrollbar":
                    case"pushBackValue":
                        this._invalidate();
                        break;
                    case"disabled":
                        this._renderDisabledState();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _resetInactiveDirection: function() {
                var inactiveProp = this._getInactiveProp();
                if (!inactiveProp)
                    return;
                var scrollOffset = this.scrollOffset();
                scrollOffset[inactiveProp] = 0;
                this.scrollTo(scrollOffset)
            },
            _getInactiveProp: function() {
                var direction = this.option("direction");
                if (direction === VERTICAL)
                    return "left";
                if (direction === HORIZONTAL)
                    return "top"
            },
            _location: function() {
                return this._strategy.location()
            },
            _normalizeLocation: function(location) {
                var direction = this.option("direction");
                return {
                        left: $.isPlainObject(location) ? -(location.left || location.x || 0) : direction !== VERTICAL ? -location : 0,
                        top: $.isPlainObject(location) ? -(location.top || location.y || 0) : direction !== HORIZONTAL ? -location : 0
                    }
            },
            _isLocked: function() {
                return this._locked
            },
            _lock: function() {
                this._locked = true
            },
            _unlock: function() {
                this._locked = false
            },
            _isDirection: function(direction) {
                var current = this.option("direction");
                if (direction === VERTICAL)
                    return current !== HORIZONTAL;
                if (direction === HORIZONTAL)
                    return current !== VERTICAL;
                return current === direction
            },
            _updateAllowedDirection: function() {
                var allowedDirections = this._strategy._allowedDirections();
                if (this._isDirection(BOTH) && allowedDirections.vertical && allowedDirections.horizontal)
                    this._allowedDirectionValue = BOTH;
                else if (this._isDirection(HORIZONTAL) && allowedDirections.horizontal)
                    this._allowedDirectionValue = HORIZONTAL;
                else if (this._isDirection(VERTICAL) && allowedDirections.vertical)
                    this._allowedDirectionValue = VERTICAL;
                else
                    this._allowedDirectionValue = null
            },
            _allowedDirection: function() {
                return this._allowedDirectionValue
            },
            content: function() {
                return this._$content
            },
            scrollOffset: function() {
                var location = this._location();
                return {
                        top: -location.top,
                        left: -location.left
                    }
            },
            scrollTop: function() {
                return this.scrollOffset().top
            },
            scrollLeft: function() {
                return this.scrollOffset().left
            },
            clientHeight: function() {
                return this._$container.height()
            },
            scrollHeight: function() {
                return this.content().height()
            },
            clientWidth: function() {
                return this._$container.width()
            },
            scrollWidth: function() {
                return this.content().width()
            },
            update: function() {
                this._strategy.update();
                this._updateAllowedDirection();
                return $.when().promise()
            },
            scrollBy: function(distance) {
                distance = this._normalizeLocation(distance);
                if (!distance.top && !distance.left)
                    return;
                this._strategy.scrollBy(distance)
            },
            scrollTo: function(targetLocation) {
                targetLocation = this._normalizeLocation(targetLocation);
                var location = this._location();
                this.scrollBy({
                    left: location.left - targetLocation.left,
                    top: location.top - targetLocation.top
                })
            },
            scrollToElement: function(element) {
                var $element = $(element);
                var elementInsideContent = this.content().find(element).length;
                var elementIsPartOfScrollable = $element.parents("." + SCROLLABLE_CLASS).length - $element.parents("." + SCROLLABLE_CONTENT_CLASS).length !== 0;
                if (!elementInsideContent || elementIsPartOfScrollable)
                    return;
                var scrollPosition = {
                        top: 0,
                        left: 0
                    };
                var direction = this.option("direction");
                if (direction !== VERTICAL)
                    scrollPosition.left = this._scrollToElementPosition($element, HORIZONTAL);
                if (direction !== HORIZONTAL)
                    scrollPosition.top = this._scrollToElementPosition($element, VERTICAL);
                this.scrollTo(scrollPosition)
            },
            _scrollToElementPosition: function($element, direction) {
                var isVertical = direction === VERTICAL;
                var pushBackOffset = isVertical ? this.option("pushBackValue") : 0;
                var elementPositionRelativeToContent = this._elementPositionRelativeToContent($element, isVertical ? 'top' : 'left');
                var elementPosition = elementPositionRelativeToContent - pushBackOffset;
                var elementSize = $element[isVertical ? 'outerHeight' : 'outerWidth']();
                var elementBottom = elementPositionRelativeToContent + elementSize;
                var scrollLocation = isVertical ? this.scrollTop() : this.scrollLeft();
                var clientSize = isVertical ? this.clientHeight() : this.clientWidth();
                var scrollBottom = scrollLocation + clientSize;
                var isEntirelyVisible = scrollLocation <= elementPosition && scrollBottom >= elementBottom;
                var isEntirelyWithOversizeVisible = scrollLocation >= elementPosition && scrollBottom <= elementBottom;
                var isAlreadyVisible = isEntirelyVisible || isEntirelyWithOversizeVisible;
                var isElementBelowScrollLocation = scrollLocation > elementPosition;
                return isAlreadyVisible ? scrollLocation : elementPosition - (isElementBelowScrollLocation ? 0 : clientSize - elementSize)
            },
            _elementPositionRelativeToContent: function($element, prop) {
                var result = 0;
                while (this._hasScrollContent($element)) {
                    result += $element.position()[prop];
                    $element = $element.offsetParent()
                }
                return result
            },
            _hasScrollContent: function($element) {
                var $content = this.content();
                return $element.closest($content).length && !$element.is($content)
            }
        }));
        ui.dxScrollable.deviceDependentOptions = deviceDependentOptions
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollbar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SCROLLBAR = "dxScrollbar",
            SCROLLABLE_SCROLLBAR_CLASS = "dx-scrollable-scrollbar",
            SCROLLABLE_SCROLLBAR_ACTIVE_CLASS = SCROLLABLE_SCROLLBAR_CLASS + "-active",
            SCROLLABLE_SCROLL_CLASS = "dx-scrollable-scroll",
            SCROLLABLE_SCROLL_CONTENT_CLASS = "dx-scrollable-scroll-content",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            HOVER_ENABLED_STATE = "dx-scrollbar-hoverable",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            THUMB_MIN_SIZE = 15;
        var SCROLLBAR_VISIBLE = {
                onScroll: "onScroll",
                onHover: "onHover",
                always: "always",
                never: "never"
            };
        DX.registerComponent(SCROLLBAR, ui.dxScrollable, ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    direction: null,
                    visible: false,
                    activeStateEnabled: false,
                    visibilityMode: SCROLLBAR_VISIBLE.onScroll,
                    containerSize: 0,
                    contentSize: 0,
                    expandable: true
                })
            },
            _init: function() {
                this.callBase();
                this._isHovered = false
            },
            _render: function() {
                this._renderThumb();
                this.callBase();
                this._renderDirection();
                this._update();
                this._attachPointerDownHandler();
                this.option("hoverStateEnabled", this._isHoverMode());
                this.element().toggleClass(HOVER_ENABLED_STATE, this.option("hoverStateEnabled"))
            },
            _renderThumb: function() {
                this._$thumb = $("<div>").addClass(SCROLLABLE_SCROLL_CLASS);
                $("<div>").addClass(SCROLLABLE_SCROLL_CONTENT_CLASS).appendTo(this._$thumb);
                this.element().addClass(SCROLLABLE_SCROLLBAR_CLASS).append(this._$thumb)
            },
            isThumb: function($element) {
                return !!this.element().find($element).length
            },
            _isHoverMode: function() {
                return this.option("visibilityMode") === SCROLLBAR_VISIBLE.onHover && this.option("expandable")
            },
            _renderDirection: function() {
                var direction = this.option("direction");
                this.element().addClass("dx-scrollbar-" + direction);
                this._dimension = direction === HORIZONTAL ? "width" : "height";
                this._prop = direction === HORIZONTAL ? "left" : "top"
            },
            _attachPointerDownHandler: function() {
                this._$thumb.on(events.addNamespace("dxpointerdown", SCROLLBAR), $.proxy(this.feedbackOn, this))
            },
            feedbackOn: function() {
                this.element().addClass(SCROLLABLE_SCROLLBAR_ACTIVE_CLASS);
                activeScrollbar = this
            },
            feedbackOff: function() {
                this.element().removeClass(SCROLLABLE_SCROLLBAR_ACTIVE_CLASS);
                activeScrollbar = null
            },
            cursorEnter: function() {
                this._isHovered = true;
                this.option("visible", true)
            },
            cursorLeave: function() {
                this._isHovered = false;
                this.option("visible", false)
            },
            _renderDimensions: function() {
                this._$thumb.outerHeight(this.option("height"));
                this._$thumb.outerWidth(this.option("width"))
            },
            _toggleVisibility: function(visible) {
                if (this.option("visibilityMode") === SCROLLBAR_VISIBLE.onScroll)
                    this._$thumb.css("opacity");
                visible = this._adjustVisibility(visible);
                this.option().visible = visible;
                this._$thumb.toggleClass("dx-state-invisible", !visible)
            },
            _adjustVisibility: function(visible) {
                if (this.containerToContentRatio() && !this._needScrollbar())
                    return false;
                switch (this.option("visibilityMode")) {
                    case SCROLLBAR_VISIBLE.onScroll:
                        break;
                    case SCROLLBAR_VISIBLE.onHover:
                        visible = visible || !!this._isHovered;
                        break;
                    case SCROLLBAR_VISIBLE.never:
                        visible = false;
                        break;
                    case SCROLLBAR_VISIBLE.always:
                        visible = true;
                        break
                }
                return visible
            },
            moveTo: function(location) {
                if (this._isHidden())
                    return;
                if ($.isPlainObject(location))
                    location = location[this._prop] || 0;
                var scrollBarLocation = {};
                scrollBarLocation[this._prop] = this._calculateScrollBarPosition(location);
                DX.translator.move(this._$thumb, scrollBarLocation)
            },
            _calculateScrollBarPosition: function(location) {
                return -location * this._thumbRatio
            },
            _update: function() {
                var containerSize = this.option("containerSize"),
                    contentSize = this.option("contentSize");
                this._containerToContentRatio = containerSize / contentSize;
                var thumbSize = Math.round(Math.max(Math.round(containerSize * this._containerToContentRatio), THUMB_MIN_SIZE));
                this._thumbRatio = (containerSize - thumbSize) / (contentSize - containerSize);
                this.option(this._dimension, thumbSize);
                this.element().toggle(this._needScrollbar())
            },
            _isHidden: function() {
                return this.option("visibilityMode") === SCROLLBAR_VISIBLE.never
            },
            _needScrollbar: function() {
                return !this._isHidden() && this._containerToContentRatio < 1
            },
            containerToContentRatio: function() {
                return this._containerToContentRatio
            },
            _normalizeSize: function(size) {
                return $.isPlainObject(size) ? size[this._dimension] || 0 : size
            },
            _clean: function() {
                this.callBase();
                if (this === activeScrollbar)
                    activeScrollbar = null;
                this._$thumb.off("." + SCROLLBAR)
            },
            _optionChanged: function(args) {
                if (this._isHidden())
                    return;
                switch (args.name) {
                    case"containerSize":
                    case"contentSize":
                        this.option()[args.name] = this._normalizeSize(args.value);
                        this._update();
                        break;
                    case"visibilityMode":
                    case"direction":
                        this._invalidate();
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            update: function() {
                this._adjustVisibility() && this.option("visible", true)
            }
        }));
        var activeScrollbar = null;
        $(document).on(events.addNamespace("dxpointerup", SCROLLBAR), function() {
            if (activeScrollbar)
                activeScrollbar.feedbackOff()
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollable.native.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            devices = DX.devices,
            abs = Math.abs;
        var SCROLLABLE_NATIVE = "dxNativeScrollable",
            SCROLLABLE_NATIVE_CLASS = "dx-scrollable-native",
            SCROLLABLE_SCROLLBAR_SIMULATED = "dx-scrollable-scrollbar-simulated",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            HIDE_SCROLLBAR_TIMOUT = 500;
        ui.dxScrollable.NativeStrategy = DX.Class.inherit({
            ctor: function(scrollable) {
                this._init(scrollable)
            },
            _init: function(scrollable) {
                this._component = scrollable;
                this._$element = scrollable.element();
                this._$container = scrollable._$container;
                this._$content = scrollable._$content;
                this._direction = scrollable.option("direction");
                this._useSimulatedScrollbar = scrollable.option("useSimulatedScrollbar");
                this._showScrollbar = scrollable.option("showScrollbar");
                this.option = $.proxy(scrollable.option, scrollable);
                this._createActionByOption = $.proxy(scrollable._createActionByOption, scrollable);
                this._isLocked = $.proxy(scrollable._isLocked, scrollable);
                this._isDirection = $.proxy(scrollable._isDirection, scrollable);
                this._allowedDirection = $.proxy(scrollable._allowedDirection, scrollable)
            },
            render: function() {
                var device = devices.real(),
                    deviceType = device.platform,
                    version = device.version[0];
                if (deviceType == "android" && version == 5)
                    deviceType += version;
                this._$element.addClass(SCROLLABLE_NATIVE_CLASS).addClass(SCROLLABLE_NATIVE_CLASS + "-" + deviceType).toggleClass(SCROLLABLE_SCROLLBARS_HIDDEN, !this._showScrollbar);
                if (this._showScrollbar && this._useSimulatedScrollbar)
                    this._renderScrollbars()
            },
            _renderScrollbars: function() {
                this._scrollbars = {};
                this._hideScrollbarTimeout = 0;
                this._$element.addClass(SCROLLABLE_SCROLLBAR_SIMULATED);
                this._renderScrollbar(VERTICAL);
                this._renderScrollbar(HORIZONTAL)
            },
            _renderScrollbar: function(direction) {
                if (!this._isDirection(direction))
                    return;
                var $scrollbar = $("<div>").dxScrollbar({
                        direction: direction,
                        expandable: this._component.option("scrollByThumb")
                    }).appendTo(this._$element);
                this._scrollbars[direction] = $scrollbar.dxScrollbar("instance")
            },
            handleInit: $.noop,
            handleStart: $.noop,
            handleMove: function(e) {
                if (this._isLocked()) {
                    e.cancel = true;
                    return
                }
                if (this._allowedDirection())
                    e.originalEvent.isScrollingEvent = true
            },
            handleEnd: $.noop,
            handleStop: $.noop,
            _eachScrollbar: function(callback) {
                callback = $.proxy(callback, this);
                $.each(this._scrollbars || {}, function(direction, scrollbar) {
                    callback(scrollbar, direction)
                })
            },
            createActions: function() {
                this._scrollAction = this._createActionByOption("onScroll");
                this._updateAction = this._createActionByOption("onUpdated")
            },
            _createActionArgs: function() {
                var location = this.location();
                return {
                        jQueryEvent: this._eventForUserAction,
                        scrollOffset: {
                            top: -location.top,
                            left: -location.left
                        },
                        reachedLeft: this._isDirection(HORIZONTAL) ? location.left >= 0 : undefined,
                        reachedRight: this._isDirection(HORIZONTAL) ? location.left <= this._containerSize.width - this._componentContentSize.width : undefined,
                        reachedTop: this._isDirection(VERTICAL) ? location.top >= 0 : undefined,
                        reachedBottom: this._isDirection(VERTICAL) ? location.top <= this._containerSize.height - this._componentContentSize.height : undefined
                    }
            },
            handleScroll: function(e) {
                if (!this._isScrollLocationChanged()) {
                    e.stopImmediatePropagation();
                    return
                }
                this._eventForUserAction = e;
                this._moveScrollbars();
                this._scrollAction(this._createActionArgs());
                this._lastLocation = this.location();
                this._pushBackFromBoundary()
            },
            _pushBackFromBoundary: function() {
                var pushBackValue = this.option("pushBackValue");
                if (!pushBackValue)
                    return;
                var scrollOffset = this._containerSize.height - this._contentSize.height,
                    scrollTopPos = this._$container.scrollTop(),
                    scrollBottomPos = scrollOffset + scrollTopPos - pushBackValue * 2;
                if (!scrollTopPos)
                    this._$container.scrollTop(pushBackValue);
                else if (!scrollBottomPos)
                    this._$container.scrollTop(pushBackValue - scrollOffset)
            },
            _isScrollLocationChanged: function() {
                var currentLocation = this.location(),
                    lastLocation = this._lastLocation || {},
                    isTopChanged = lastLocation.top !== currentLocation.top,
                    isLeftChanged = lastLocation.left !== currentLocation.left;
                return isTopChanged || isLeftChanged
            },
            _moveScrollbars: function() {
                this._eachScrollbar(function(scrollbar) {
                    scrollbar.moveTo(this.location());
                    scrollbar.option("visible", true)
                });
                this._hideScrollbars()
            },
            _hideScrollbars: function() {
                clearTimeout(this._hideScrollbarTimeout);
                this._hideScrollbarTimeout = setTimeout($.proxy(function() {
                    this._eachScrollbar(function(scrollbar) {
                        scrollbar.option("visible", false)
                    })
                }, this), HIDE_SCROLLBAR_TIMOUT)
            },
            location: function() {
                return {
                        left: -this._$container.scrollLeft(),
                        top: this.option("pushBackValue") - this._$container.scrollTop()
                    }
            },
            disabledChanged: $.noop,
            update: function() {
                this._update();
                this._updateAction(this._createActionArgs())
            },
            _update: function() {
                this._updateDimensions();
                this._updateScrollbars()
            },
            _updateDimensions: function() {
                this._containerSize = {
                    height: this._$container.height(),
                    width: this._$container.width()
                };
                this._componentContentSize = {
                    height: this._component.content().height(),
                    width: this._component.content().width()
                };
                this._contentSize = {
                    height: this._$content.height(),
                    width: this._$content.width()
                };
                this._pushBackFromBoundary()
            },
            _updateScrollbars: function() {
                this._eachScrollbar(function(scrollbar, direction) {
                    var dimension = direction === VERTICAL ? "height" : "width";
                    scrollbar.option({
                        containerSize: this._containerSize[dimension],
                        contentSize: this._componentContentSize[dimension]
                    });
                    scrollbar.update()
                })
            },
            _allowedDirections: function() {
                return {
                        vertical: this._isDirection(VERTICAL) && this._contentSize.height > this._containerSize.height,
                        horizontal: this._isDirection(HORIZONTAL) && this._contentSize.width > this._containerSize.width
                    }
            },
            dispose: function() {
                this._$element.removeClass(function(index, className) {
                    var scrollableNativeRegexp = new RegExp(SCROLLABLE_NATIVE_CLASS + "\\S*", "g");
                    if (scrollableNativeRegexp.test(className))
                        return className.match(scrollableNativeRegexp).join(" ")
                });
                this._$element.off("." + SCROLLABLE_NATIVE);
                this._$container.off("." + SCROLLABLE_NATIVE);
                this._removeScrollbars();
                clearTimeout(this._gestureEndTimer);
                clearTimeout(this._hideScrollbarTimeout)
            },
            _removeScrollbars: function() {
                this._eachScrollbar(function(scrollbar) {
                    scrollbar.element().remove()
                })
            },
            scrollBy: function(distance) {
                var location = this.location();
                this._$container.scrollTop(-location.top - distance.top + this.option("pushBackValue"));
                this._$container.scrollLeft(-location.left - distance.left)
            },
            validate: function() {
                return !this.option("disabled") && this._allowedDirection()
            },
            getDirection: function() {
                return this._allowedDirection()
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollable.simulated.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            math = Math,
            translator = DX.translator;
        var isIE = DX.browser.msie;
        var realDevice = DX.devices.real;
        var isSluggishPlatform = realDevice.platform === "win8" || realDevice.platform === "android";
        var SCROLLABLE_SIMULATED = "dxSimulatedScrollable",
            SCROLLABLE_STRATEGY = "dxScrollableStrategy",
            SCROLLABLE_SIMULATED_CURSOR = SCROLLABLE_SIMULATED + "Cursor",
            SCROLLABLE_SIMULATED_KEYBOARD = SCROLLABLE_SIMULATED + "Keyboard",
            SCROLLABLE_SIMULATED_CLASS = "dx-scrollable-simulated",
            SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden",
            SCROLLABLE_SCROLLBAR_CLASS = "dx-scrollable-scrollbar",
            VERTICAL = "vertical",
            HORIZONTAL = "horizontal",
            ACCELERATION = isSluggishPlatform ? 0.95 : 0.92,
            OUT_BOUNDS_ACCELERATION = 0.5,
            MIN_VELOCITY_LIMIT = 1,
            FRAME_DURATION = math.round(1000 / 60),
            SCROLL_LINE_HEIGHT = 20,
            BOUNCE_MIN_VELOCITY_LIMIT = MIN_VELOCITY_LIMIT / 5,
            BOUNCE_DURATION = isSluggishPlatform ? 300 : 400,
            BOUNCE_FRAMES = BOUNCE_DURATION / FRAME_DURATION,
            BOUNCE_ACCELERATION_SUM = (1 - math.pow(ACCELERATION, BOUNCE_FRAMES)) / (1 - ACCELERATION);
        var KEY_CODES = {
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                END: 35,
                HOME: 36,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40
            };
        var scrollIntoViewIfNeededCallbacks = function() {
                var callbacks = $.Callbacks();
                var FOCUS_TIMEOUT = 50,
                    cancelChangeTimestamp = null;
                $(window).on(events.addNamespace("focus", SCROLLABLE_STRATEGY), function() {
                    cancelChangeTimestamp = $.now()
                });
                $(document).on(events.addNamespace("dxpointerdown", SCROLLABLE_STRATEGY), function() {
                    cancelChangeTimestamp = $.now()
                });
                var focusChange = function(e) {
                        var keyboardElementChange = $.now() - cancelChangeTimestamp > FOCUS_TIMEOUT,
                            focusedCorrectElement = e.target === document.activeElement;
                        if (keyboardElementChange && focusedCorrectElement)
                            callbacks.fire(e.target)
                    };
                if (window.addEventListener)
                    window.addEventListener("focus", focusChange, true);
                else
                    window.attachEvent("onfocusin", focusChange);
                return callbacks
            }();
        var InertiaAnimator = DX.Animator.inherit({
                ctor: function(scroller) {
                    this.callBase();
                    this.scroller = scroller
                },
                VELOCITY_LIMIT: MIN_VELOCITY_LIMIT,
                _isFinished: function() {
                    return math.abs(this.scroller._velocity) <= this.VELOCITY_LIMIT
                },
                _step: function() {
                    this.scroller._scrollStep(this.scroller._velocity);
                    this.scroller._velocity *= this._acceleration()
                },
                _acceleration: function() {
                    return this.scroller._inBounds() ? ACCELERATION : OUT_BOUNDS_ACCELERATION
                },
                _complete: function() {
                    this.scroller._scrollComplete()
                },
                _stop: function() {
                    this.scroller._stopComplete()
                }
            });
        var BounceAnimator = InertiaAnimator.inherit({
                VELOCITY_LIMIT: BOUNCE_MIN_VELOCITY_LIMIT,
                _isFinished: function() {
                    return this.scroller._crossBoundOnNextStep() || this.callBase()
                },
                _acceleration: function() {
                    return ACCELERATION
                },
                _complete: function() {
                    this.scroller._move(this.scroller._bounceLocation);
                    this.callBase()
                }
            });
        var isWheelEvent = function(e) {
                return e.type === "dxmousewheel"
            };
        var Scroller = ui.dxScrollable.Scroller = DX.Class.inherit({
                ctor: function(options) {
                    this._initOptions(options);
                    this._initAnimators();
                    this._initScrollbar()
                },
                _initOptions: function(options) {
                    this._location = 0;
                    this._topReached = false;
                    this._bottomReached = false;
                    this._axis = options.direction === HORIZONTAL ? "x" : "y";
                    this._prop = options.direction === HORIZONTAL ? "left" : "top";
                    this._dimension = options.direction === HORIZONTAL ? "width" : "height";
                    this._scrollProp = options.direction === HORIZONTAL ? "scrollLeft" : "scrollTop";
                    $.each(options, $.proxy(function(optionName, optionValue) {
                        this["_" + optionName] = optionValue
                    }, this))
                },
                _initAnimators: function() {
                    this._inertiaAnimator = new InertiaAnimator(this);
                    this._bounceAnimator = new BounceAnimator(this)
                },
                _initScrollbar: function() {
                    this._$scrollbar = $("<div>").dxScrollbar({
                        direction: this._direction,
                        visible: this._scrollByThumb,
                        visibilityMode: this._visibilityModeNormalize(this._scrollbarVisible),
                        containerSize: this._containerSize(),
                        contentSize: this._contentSize(),
                        expandable: this._scrollByThumb
                    }).appendTo(this._$container);
                    this._scrollbar = this._$scrollbar.dxScrollbar("instance")
                },
                _visibilityModeNormalize: function(mode) {
                    return mode === true ? "onScroll" : mode === false ? "never" : mode
                },
                _scrollStep: function(delta) {
                    var prevLocation = this._location;
                    this._location += delta;
                    this._suppressBounce();
                    this._move();
                    if (prevLocation !== this._location) {
                        this._scrollAction();
                        $.data(this._$container.get(0), "scroll")()
                    }
                },
                _suppressBounce: function() {
                    if (this._bounceEnabled || this._inBounds(this._location))
                        return;
                    this._velocity = 0;
                    this._location = this._boundLocation()
                },
                _boundLocation: function() {
                    var location = math.min(this._location, this._maxOffset);
                    return math.max(location, this._minOffset)
                },
                _move: function(location) {
                    this._location = location !== undefined ? location : this._location;
                    this._moveContent();
                    this._moveScrollbar()
                },
                _moveContent: function() {
                    var targetLocation = {};
                    targetLocation[this._prop] = this._location;
                    translator.move(this._$content, targetLocation)
                },
                _moveScrollbar: function() {
                    this._scrollbar.moveTo(this._location)
                },
                _scrollComplete: function() {
                    if (this._inBounds()) {
                        this._hideScrollbar();
                        this._correctLocation();
                        if (this._completeDeferred)
                            this._completeDeferred.resolve()
                    }
                    this._scrollToBounds()
                },
                _correctLocation: function() {
                    this._location = math.round(this._location);
                    this._move()
                },
                _scrollToBounds: function() {
                    if (this._inBounds())
                        return;
                    this._bounceAction();
                    this._setupBounce();
                    this._bounceAnimator.start()
                },
                _setupBounce: function() {
                    var boundLocation = this._bounceLocation = this._boundLocation(),
                        bounceDistance = boundLocation - this._location;
                    this._velocity = bounceDistance / BOUNCE_ACCELERATION_SUM
                },
                _inBounds: function(location) {
                    location = location !== undefined ? location : this._location;
                    return location >= this._minOffset && location <= this._maxOffset
                },
                _crossBoundOnNextStep: function() {
                    var location = this._location,
                        nextLocation = location + this._velocity;
                    return location < this._minOffset && nextLocation >= this._minOffset || location > this._maxOffset && nextLocation <= this._maxOffset
                },
                _initHandler: function(e) {
                    this._stopDeferred = $.Deferred();
                    this._stopScrolling();
                    this._prepareThumbScrolling(e);
                    return this._stopDeferred.promise()
                },
                _stopScrolling: function() {
                    this._hideScrollbar();
                    this._inertiaAnimator.stop();
                    this._bounceAnimator.stop()
                },
                _prepareThumbScrolling: function(e) {
                    if (isWheelEvent(e.originalEvent))
                        return;
                    var $target = $(e.originalEvent.target);
                    var scrollbarClicked = this._isScrollbar($target);
                    if (scrollbarClicked)
                        this._moveToMouseLocation(e);
                    this._thumbScrolling = scrollbarClicked || this._isThumb($target);
                    if (this._thumbScrolling)
                        this._scrollbar.feedbackOn()
                },
                _moveToMouseLocation: function(e) {
                    var mouseLocation = e["page" + this._axis.toUpperCase()] - this._$element.offset()[this._prop];
                    var location = this._location + mouseLocation / this._containerToContentRatio() - this._$container.height() / 2;
                    this._scrollStep(-location)
                },
                _stopComplete: function() {
                    if (this._stopDeferred)
                        this._stopDeferred.resolve()
                },
                _startHandler: function() {
                    this._showScrollbar()
                },
                _moveHandler: function(delta) {
                    delta = delta[this._axis];
                    if (this._thumbScrolling)
                        delta = -delta / this._containerToContentRatio();
                    if (!this._inBounds())
                        delta *= OUT_BOUNDS_ACCELERATION;
                    this._scrollStep(delta)
                },
                _containerToContentRatio: function() {
                    return this._scrollbar.containerToContentRatio()
                },
                _endHandler: function(velocity) {
                    this._completeDeferred = $.Deferred();
                    this._velocity = velocity[this._axis];
                    this._inertiaHandler();
                    this._resetThumbScrolling();
                    return this._completeDeferred.promise()
                },
                _inertiaHandler: function() {
                    this._suppressIntertia();
                    this._inertiaAnimator.start()
                },
                _suppressIntertia: function() {
                    if (!this._inertiaEnabled || this._thumbScrolling)
                        this._velocity = 0
                },
                _resetThumbScrolling: function() {
                    this._thumbScrolling = false
                },
                _stopHandler: function() {
                    this._resetThumbScrolling();
                    this._scrollToBounds()
                },
                _disposeHandler: function() {
                    this._stopScrolling();
                    this._$scrollbar.remove()
                },
                _updateHandler: function() {
                    this._update();
                    this._moveToBounds()
                },
                _update: function() {
                    this._stopScrolling();
                    this._updateLocation();
                    this._updateBounds();
                    this._updateScrollbar();
                    this._moveScrollbar();
                    this._scrollbar.update()
                },
                _updateLocation: function() {
                    this._location = translator.locate(this._$content)[this._prop]
                },
                _updateBounds: function() {
                    this._maxOffset = this._getMaxOffset();
                    this._minOffset = this._getMinOffset()
                },
                _getMaxOffset: function() {
                    return 0
                },
                _getMinOffset: function() {
                    return math.min(this._containerSize() - this._contentSize(), 0)
                },
                _updateScrollbar: function() {
                    this._scrollbar.option({
                        containerSize: this._containerSize(),
                        contentSize: this._contentSize()
                    })
                },
                _moveToBounds: function() {
                    this._location = this._boundLocation();
                    this._move()
                },
                _createActionsHandler: function(actions) {
                    this._scrollAction = actions.scroll;
                    this._bounceAction = actions.bounce
                },
                _showScrollbar: function() {
                    this._scrollbar.option("visible", true)
                },
                _hideScrollbar: function() {
                    this._scrollbar.option("visible", false)
                },
                _containerSize: function() {
                    return this._$container[this._dimension]()
                },
                _contentSize: function() {
                    return this._$content[this._dimension]()
                },
                _validateEvent: function(e) {
                    var $target = $(e.originalEvent.target);
                    if (this._isThumb($target) || this._isScrollbar($target)) {
                        e.preventDefault();
                        return true
                    }
                    return this._isContent($target)
                },
                _isThumb: function($element) {
                    return this._scrollByThumb && this._scrollbar.isThumb($element)
                },
                _isScrollbar: function($element) {
                    return this._scrollByThumb && $element && $element.is(this._$scrollbar)
                },
                _isContent: function($element) {
                    return this._scrollByContent && !!$element.closest(this._$element).length
                },
                _reachedMin: function() {
                    return this._location <= this._minOffset
                },
                _reachedMax: function() {
                    return this._location >= this._maxOffset
                },
                _cursorEnterHandler: function() {
                    this._scrollbar.cursorEnter()
                },
                _cursorLeaveHandler: function() {
                    this._scrollbar.cursorLeave()
                },
                dispose: $.noop
            });
        var hoveredScrollable,
            activeScrollable;
        ui.dxScrollable.SimulatedStrategy = DX.Class.inherit({
            ctor: function(scrollable) {
                this._init(scrollable)
            },
            _init: function(scrollable) {
                this._component = scrollable;
                this._$element = scrollable.element();
                this._$container = scrollable._$container;
                this._$content = scrollable._$content;
                this.option = $.proxy(scrollable.option, scrollable);
                this._createActionByOption = $.proxy(scrollable._createActionByOption, scrollable);
                this._isLocked = $.proxy(scrollable._isLocked, scrollable);
                this._isDirection = $.proxy(scrollable._isDirection, scrollable);
                this._allowedDirection = $.proxy(scrollable._allowedDirection, scrollable);
                this._proxiedActiveElementChangeHandler = $.proxy(this._activeElementChangeHandler, this);
                scrollIntoViewIfNeededCallbacks.add(this._proxiedActiveElementChangeHandler)
            },
            _activeElementChangeHandler: function(activeElement) {
                this._component.scrollToElement(activeElement)
            },
            render: function() {
                this._$element.addClass(SCROLLABLE_SIMULATED_CLASS);
                this._createScrollers();
                if (this.option("useKeyboard"))
                    this._$container.prop("tabindex", 0);
                this._attachKeyboardHandler();
                this._attachCursorHandlers()
            },
            _createScrollers: function() {
                this._scrollers = {};
                if (this._isDirection(HORIZONTAL))
                    this._createScroller(HORIZONTAL);
                if (this._isDirection(VERTICAL))
                    this._createScroller(VERTICAL);
                this._$element.toggleClass(SCROLLABLE_SCROLLBARS_HIDDEN, !this.option("showScrollbar"))
            },
            _createScroller: function(direction) {
                this._scrollers[direction] = new Scroller(this._scrollerOptions(direction))
            },
            _scrollerOptions: function(direction) {
                return {
                        direction: direction,
                        $content: this._$content,
                        $container: this._$container,
                        $element: this._$element,
                        scrollByContent: this.option("scrollByContent"),
                        scrollByThumb: this.option("scrollByThumb"),
                        scrollbarVisible: this.option("showScrollbar"),
                        bounceEnabled: this.option("bounceEnabled"),
                        inertiaEnabled: this.option("inertiaEnabled")
                    }
            },
            handleInit: function(e) {
                this._supressDirections(e);
                this._eventForUserAction = e;
                this._eventHandler("init", e).done(this._stopAction)
            },
            _supressDirections: function(e) {
                if (isWheelEvent(e.originalEvent)) {
                    this._prepareDirections(true);
                    return
                }
                this._prepareDirections();
                this._eachScroller(function(scroller, direction) {
                    var isValid = scroller._validateEvent(e);
                    this._validDirections[direction] = isValid
                })
            },
            _prepareDirections: function(value) {
                value = value || false;
                this._validDirections = {};
                this._validDirections[HORIZONTAL] = value;
                this._validDirections[VERTICAL] = value
            },
            _eachScroller: function(callback) {
                callback = $.proxy(callback, this);
                $.each(this._scrollers, function(direction, scroller) {
                    callback(scroller, direction)
                })
            },
            handleStart: function(e) {
                this._saveActive();
                this._eventHandler("start").done(this._startAction)
            },
            _saveActive: function() {
                activeScrollable = this
            },
            _resetActive: function() {
                activeScrollable = null
            },
            _validateDirection: function(delta) {
                var result = false;
                this._eachScroller(function(scroller) {
                    result = result || scroller._validateDirection(delta)
                });
                return result
            },
            handleMove: function(e) {
                if (this._isLocked()) {
                    e.cancel = true;
                    this._resetActive();
                    return
                }
                e.preventDefault && e.preventDefault();
                this._adjustDistance(e.delta);
                this._eventForUserAction = e;
                this._eventHandler("move", e.delta)
            },
            _adjustDistance: function(distance) {
                distance.x *= this._validDirections[HORIZONTAL];
                distance.y *= this._validDirections[VERTICAL]
            },
            handleEnd: function(e) {
                this._resetActive();
                this._refreshCursorState(e.originalEvent && e.originalEvent.target);
                this._adjustDistance(e.velocity);
                this._eventForUserAction = e;
                return this._eventHandler("end", e.velocity).done(this._endAction)
            },
            handleCancel: function(e) {
                this._resetActive();
                this._eventForUserAction = e;
                return this._eventHandler("end", {
                        x: 0,
                        y: 0
                    })
            },
            handleStop: function() {
                this._resetActive();
                this._eventHandler("stop")
            },
            handleScroll: function() {
                var distance = {
                        left: this.option("direction") !== VERTICAL ? -this._$container.scrollLeft() : 0,
                        top: this.option("direction") !== HORIZONTAL ? -this._$container.scrollTop() : 0
                    };
                if (!distance.left && !distance.top)
                    return;
                this._$container.scrollLeft(0);
                this._$container.scrollTop(0);
                this.scrollBy(distance)
            },
            _attachKeyboardHandler: function() {
                this._$element.off("." + SCROLLABLE_SIMULATED_KEYBOARD);
                if (!this.option("disabled") && this.option("useKeyboard"))
                    this._$element.on(events.addNamespace("keydown", SCROLLABLE_SIMULATED_KEYBOARD), $.proxy(this._keyDownHandler, this))
            },
            _keyDownHandler: function(e) {
                if (!this._$container.is(document.activeElement))
                    return;
                var handled = true;
                switch (e.keyCode) {
                    case KEY_CODES.DOWN:
                        this._scrollByLine({y: 1});
                        break;
                    case KEY_CODES.UP:
                        this._scrollByLine({y: -1});
                        break;
                    case KEY_CODES.RIGHT:
                        this._scrollByLine({x: 1});
                        break;
                    case KEY_CODES.LEFT:
                        this._scrollByLine({x: -1});
                        break;
                    case KEY_CODES.PAGE_DOWN:
                        this._scrollByPage(1);
                        break;
                    case KEY_CODES.PAGE_UP:
                        this._scrollByPage(-1);
                        break;
                    case KEY_CODES.HOME:
                        this._scrollToHome();
                        break;
                    case KEY_CODES.END:
                        this._scrollToEnd();
                        break;
                    default:
                        handled = false;
                        break
                }
                if (handled) {
                    e.stopPropagation();
                    e.preventDefault()
                }
            },
            _scrollByLine: function(lines) {
                this.scrollBy({
                    top: (lines.y || 0) * -SCROLL_LINE_HEIGHT,
                    left: (lines.x || 0) * -SCROLL_LINE_HEIGHT
                })
            },
            _scrollByPage: function(page) {
                var prop = this._wheelProp(),
                    dimension = this._dimensionByProp(prop);
                var distance = {};
                distance[prop] = page * -this._$container[dimension]();
                this.scrollBy(distance)
            },
            _dimensionByProp: function(prop) {
                return prop === "left" ? "width" : "height"
            },
            _scrollToHome: function() {
                var prop = this._wheelProp();
                var distance = {};
                distance[prop] = 0;
                this._component.scrollTo(distance)
            },
            _scrollToEnd: function() {
                var prop = this._wheelProp(),
                    dimension = this._dimensionByProp(prop);
                var distance = {};
                distance[prop] = this._$content[dimension]() - this._$container[dimension]();
                this._component.scrollTo(distance)
            },
            createActions: function() {
                this._startAction = this._createActionHandler("onStart");
                this._stopAction = this._createActionHandler("onStop");
                this._endAction = this._createActionHandler("onEnd");
                this._updateAction = this._createActionHandler("onUpdated");
                this._createScrollerActions()
            },
            _createScrollerActions: function() {
                this._eventHandler("createActions", {
                    scroll: this._createActionHandler("onScroll"),
                    bounce: this._createActionHandler("onBounce")
                })
            },
            _createActionHandler: function(optionName) {
                var that = this,
                    actionHandler = that._createActionByOption(optionName);
                return function() {
                        actionHandler($.extend(that._createActionArgs(), arguments))
                    }
            },
            _createActionArgs: function() {
                var scrollerX = this._scrollers[HORIZONTAL],
                    scrollerY = this._scrollers[VERTICAL];
                return {
                        jQueryEvent: this._eventForUserAction,
                        scrollOffset: {
                            top: scrollerY && -scrollerY._location,
                            left: scrollerX && -scrollerX._location
                        },
                        reachedLeft: scrollerX && scrollerX._reachedMax(),
                        reachedRight: scrollerX && scrollerX._reachedMin(),
                        reachedTop: scrollerY && scrollerY._reachedMax(),
                        reachedBottom: scrollerY && scrollerY._reachedMin()
                    }
            },
            _eventHandler: function(eventName) {
                var args = $.makeArray(arguments).slice(1),
                    deferreds = $.map(this._scrollers, function(scroller) {
                        return scroller["_" + eventName + "Handler"].apply(scroller, args)
                    });
                return $.when.apply($, deferreds).promise()
            },
            location: function() {
                return translator.locate(this._$content)
            },
            disabledChanged: function() {
                this._attachCursorHandlers()
            },
            _attachCursorHandlers: function() {
                this._$element.off("." + SCROLLABLE_SIMULATED_CURSOR);
                if (!this.option("disabled") && this._isHoverMode())
                    this._$element.on(events.addNamespace("mouseenter", SCROLLABLE_SIMULATED_CURSOR), $.proxy(this._cursorEnterHandler, this)).on(events.addNamespace("mouseleave", SCROLLABLE_SIMULATED_CURSOR), $.proxy(this._cursorLeaveHandler, this))
            },
            _isHoverMode: function() {
                return this.option("showScrollbar") === "onHover"
            },
            _cursorEnterHandler: function(e) {
                e = e || {};
                e.originalEvent = e.originalEvent || {};
                if (activeScrollable || e.originalEvent._hoverHandled)
                    return;
                if (hoveredScrollable)
                    hoveredScrollable._cursorLeaveHandler();
                hoveredScrollable = this;
                this._eventHandler("cursorEnter");
                e.originalEvent._hoverHandled = true
            },
            _cursorLeaveHandler: function(e) {
                if (hoveredScrollable !== this || activeScrollable === hoveredScrollable)
                    return;
                this._eventHandler("cursorLeave");
                hoveredScrollable = null;
                this._refreshCursorState(e && e.relatedTarget)
            },
            _refreshCursorState: function(target) {
                if (!this._isHoverMode() && (!target || activeScrollable))
                    return;
                var $target = $(target);
                var $scrollable = $target.closest("." + SCROLLABLE_SIMULATED_CLASS + ":not(.dx-state-disabled)");
                var targetScrollable = $scrollable.length && $scrollable.data(SCROLLABLE_STRATEGY);
                if (hoveredScrollable && hoveredScrollable !== targetScrollable)
                    hoveredScrollable._cursorLeaveHandler();
                if (targetScrollable)
                    targetScrollable._cursorEnterHandler()
            },
            update: function() {
                return this._eventHandler("update").done(this._updateAction)
            },
            _allowedDirections: function() {
                var bounceEnabled = this.option("bounceEnabled");
                return {
                        vertical: this._isDirection(VERTICAL) && (this._scrollers[VERTICAL]._minOffset < 0 || bounceEnabled),
                        horizontal: this._isDirection(HORIZONTAL) && (this._scrollers[HORIZONTAL]._minOffset < 0 || bounceEnabled)
                    }
            },
            scrollBy: function(distance) {
                this._prepareDirections(true);
                this._eventHandler("start").done(this._startAction);
                this._eventHandler("move", {
                    x: distance.left,
                    y: distance.top
                });
                this._eventHandler("end", {
                    x: 0,
                    y: 0
                }).done(this._endAction)
            },
            validate: function(e) {
                if (this.option("disabled"))
                    return false;
                if (this.option("bounceEnabled"))
                    return true;
                return isWheelEvent(e) ? this._validateWheel(e) : this._validateMove(e)
            },
            _validateWheel: function(e) {
                var scroller = this._scrollers[this._wheelDirection()];
                var reachedMin = scroller._reachedMin();
                var reachedMax = scroller._reachedMax();
                var contentGreaterThanContainer = !reachedMin || !reachedMax;
                var locatedNotAtBound = !reachedMin && !reachedMax;
                var scrollFromMin = reachedMin && e.delta > 0;
                var scrollFromMax = reachedMax && e.delta < 0;
                return contentGreaterThanContainer && (locatedNotAtBound || scrollFromMin || scrollFromMax)
            },
            _validateMove: function(e) {
                if (!this.option("scrollByContent") && !$(e.target).closest("." + SCROLLABLE_SCROLLBAR_CLASS).length)
                    return false;
                return this._allowedDirection()
            },
            getDirection: function(e) {
                return isWheelEvent(e) ? this._wheelDirection() : this._allowedDirection()
            },
            _wheelProp: function() {
                return this._wheelDirection() === HORIZONTAL ? "left" : "top"
            },
            _wheelDirection: function() {
                switch (this.option("direction")) {
                    case HORIZONTAL:
                        return HORIZONTAL;
                    case VERTICAL:
                        return VERTICAL;
                    default:
                        return this._scrollers[VERTICAL]._containerToContentRatio() >= 1 ? HORIZONTAL : VERTICAL
                }
            },
            dispose: function() {
                scrollIntoViewIfNeededCallbacks.remove(this._proxiedActiveElementChangeHandler);
                if (activeScrollable === this)
                    activeScrollable = null;
                if (hoveredScrollable === this)
                    hoveredScrollable = null;
                this._eventHandler("dispose");
                this._detachEventHandlers();
                this._$element.removeClass(SCROLLABLE_SIMULATED_CLASS);
                this._eventForUserAction = null;
                clearTimeout(this._gestureEndTimer)
            },
            _detachEventHandlers: function() {
                this._$element.off("." + SCROLLABLE_SIMULATED_CURSOR);
                this._$container.off("." + SCROLLABLE_SIMULATED_KEYBOARD)
            }
        });
        ui.dxScrollable.__internals = $.extend(ui.dxScrollable.__internals || {}, {
            ACCELERATION: ACCELERATION,
            MIN_VELOCITY_LIMIT: MIN_VELOCITY_LIMIT,
            FRAME_DURATION: FRAME_DURATION,
            SCROLL_LINE_HEIGHT: SCROLL_LINE_HEIGHT,
            scrollIntoViewIfNeededCallbacks: scrollIntoViewIfNeededCallbacks
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var SCROLLVIEW_CLASS = "dx-scrollview",
            SCROLLVIEW_CONTENT_CLASS = SCROLLVIEW_CLASS + "-content",
            SCROLLVIEW_TOP_POCKET_CLASS = SCROLLVIEW_CLASS + "-top-pocket",
            SCROLLVIEW_BOTTOM_POCKET_CLASS = SCROLLVIEW_CLASS + "-bottom-pocket",
            SCROLLVIEW_PULLDOWN_CLASS = SCROLLVIEW_CLASS + "-pull-down",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = SCROLLVIEW_PULLDOWN_CLASS + "-text",
            SCROLLVIEW_REACHBOTTOM_CLASS = SCROLLVIEW_CLASS + "-scrollbottom",
            SCROLLVIEW_REACHBOTTOM_INDICATOR_CLASS = SCROLLVIEW_REACHBOTTOM_CLASS + "-indicator",
            SCROLLVIEW_REACHBOTTOM_TEXT_CLASS = SCROLLVIEW_REACHBOTTOM_CLASS + "-text",
            SCROLLVIEW_LOADPANEL = SCROLLVIEW_CLASS + "-loadpanel";
        DX.registerComponent("dxScrollView", ui, ui.dxScrollable.inherit({
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    pullDownAction: {
                        since: "14.2",
                        alias: "onPullDown"
                    },
                    reachBottomAction: {
                        since: "14.2",
                        alias: "onReachBottom"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    pullingDownText: Globalize.localize("dxScrollView-pullingDownText"),
                    pulledDownText: Globalize.localize("dxScrollView-pulledDownText"),
                    refreshingText: Globalize.localize("dxScrollView-refreshingText"),
                    reachBottomText: Globalize.localize("dxScrollView-reachBottomText"),
                    onPullDown: null,
                    onReachBottom: null,
                    refreshStrategy: "pullDown"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                var realDevice = DevExpress.devices.real();
                                return realDevice.platform === "android"
                            },
                            options: {refreshStrategy: "swipeDown"}
                        }, {
                            device: function(device) {
                                return DevExpress.devices.real().platform === "win8"
                            },
                            options: {refreshStrategy: "slideDown"}
                        }])
            },
            _init: function() {
                this.callBase();
                this._loadingIndicatorEnabled = true
            },
            _initMarkup: function() {
                this.callBase();
                this.element().addClass(SCROLLVIEW_CLASS);
                this._initContent();
                this._initTopPocket();
                this._initBottomPocket();
                this._initLoadPanel()
            },
            _initContent: function() {
                var $content = $("<div>").addClass(SCROLLVIEW_CONTENT_CLASS);
                this._$content.wrapInner($content)
            },
            _initTopPocket: function() {
                var $topPocket = this._$topPocket = $("<div>").addClass(SCROLLVIEW_TOP_POCKET_CLASS),
                    $pullDown = this._$pullDown = $("<div>").addClass(SCROLLVIEW_PULLDOWN_CLASS);
                $topPocket.append($pullDown);
                this._$content.prepend($topPocket)
            },
            _initBottomPocket: function() {
                var $bottomPocket = this._$bottomPocket = $("<div>").addClass(SCROLLVIEW_BOTTOM_POCKET_CLASS),
                    $reachBottom = this._$reachBottom = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_CLASS),
                    $loadContainer = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_INDICATOR_CLASS),
                    $loadIndicator = $("<div>").dxLoadIndicator(),
                    $text = this._$reachBottomText = $("<div>").addClass(SCROLLVIEW_REACHBOTTOM_TEXT_CLASS);
                this._updateReachBottomText();
                $reachBottom.append($loadContainer.append($loadIndicator)).append($text);
                $bottomPocket.append($reachBottom);
                this._$content.append($bottomPocket)
            },
            _initLoadPanel: function() {
                this._loadPanel = this._createComponent($("<div>").addClass(SCROLLVIEW_LOADPANEL).appendTo(this.element()), "dxLoadPanel", {
                    shading: false,
                    delay: 400,
                    message: this.option("refreshingText"),
                    position: {of: this.element()}
                })
            },
            _updateReachBottomText: function() {
                this._$reachBottomText.text(this.option("reachBottomText"))
            },
            _createStrategy: function() {
                var strategyName = this.option("useNative") ? this.option("refreshStrategy") : "simulated";
                var strategyClass = ui.dxScrollView.refreshStrategies[strategyName];
                if (!strategyClass)
                    throw Error("E1030", this.option("refreshStrategy"));
                this._strategy = new strategyClass(this);
                this._strategy.pullDownCallbacks.add($.proxy(this._pullDownHandler, this));
                this._strategy.releaseCallbacks.add($.proxy(this._releaseHandler, this));
                this._strategy.reachBottomCallbacks.add($.proxy(this._reachBottomHandler, this))
            },
            _createActions: function() {
                this.callBase();
                this._pullDownAction = this._createActionByOption("onPullDown");
                this._reachBottomAction = this._createActionByOption("onReachBottom");
                this._pullDownEnable(!!this.option("onPullDown") && !DX.designMode);
                this._reachBottomEnable(!!this.option("onReachBottom") && !DX.designMode)
            },
            _pullDownEnable: function(enabled) {
                if (arguments.length === 0)
                    return this._pullDownEnabled;
                this._$pullDown.toggle(enabled);
                this._strategy.pullDownEnable(enabled);
                this._pullDownEnabled = enabled
            },
            _reachBottomEnable: function(enabled) {
                if (arguments.length === 0)
                    return this._reachBottomEnabled;
                this._$reachBottom.toggle(enabled);
                this._strategy.reachBottomEnable(enabled);
                this._reachBottomEnabled = enabled
            },
            _pullDownHandler: function() {
                this._loadingIndicator(false);
                this._pullDownLoading()
            },
            _loadingIndicator: function(value) {
                if (arguments.length < 1)
                    return this._loadingIndicatorEnabled;
                this._loadingIndicatorEnabled = value
            },
            _pullDownLoading: function() {
                this.startLoading();
                this._pullDownAction()
            },
            _reachBottomHandler: function() {
                this._loadingIndicator(false);
                this._reachBottomLoading()
            },
            _reachBottomLoading: function() {
                this.startLoading();
                this._reachBottomAction()
            },
            _releaseHandler: function() {
                this.finishLoading();
                this._loadingIndicator(true)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"onPullDown":
                    case"onReachBottom":
                        this._createActions();
                        break;
                    case"pullingDownText":
                    case"pulledDownText":
                    case"refreshingText":
                    case"refreshStrategy":
                        this._invalidate();
                        break;
                    case"reachBottomText":
                        this._updateReachBottomText();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            isEmpty: function() {
                return !this.content().children().length
            },
            content: function() {
                return this._$content.children().eq(1)
            },
            release: function(preventReachBottom) {
                if (preventReachBottom !== undefined)
                    this.toggleLoading(!preventReachBottom);
                return this._strategy.release()
            },
            toggleLoading: function(showOrHide) {
                this._reachBottomEnable(showOrHide)
            },
            isFull: function() {
                return this.content().height() >= this._$container.height()
            },
            refresh: function() {
                if (!this.option("onPullDown"))
                    return;
                this._strategy.pendingRelease();
                this._pullDownLoading()
            },
            startLoading: function() {
                if (this._loadingIndicator() && this.element().is(":visible"))
                    this._loadPanel.show();
                this._lock()
            },
            finishLoading: function() {
                this._loadPanel.hide();
                this._unlock()
            },
            _dispose: function() {
                this._strategy.dispose();
                this.callBase();
                if (this._loadPanel)
                    this._loadPanel.element().remove()
            }
        }));
        ui.dxScrollView.refreshStrategies = {}
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.native.pullDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3;
        var PullDownNativeScrollViewStrategy = ui.dxScrollable.NativeStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$refreshingText = scrollView._$refreshingText;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._releaseState()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator(),
                        $text = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($text);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($text);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($text);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($text)
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._refreshPullDownText()
                },
                _pushBackFromBoundary: function() {
                    if (!this._isLocked() && !this._component.isEmpty())
                        this.callBase()
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                update: function() {
                    this.callBase();
                    this._setTopPocketOffset()
                },
                _updateDimensions: function() {
                    this.callBase();
                    this._topPocketSize = this._$topPocket.height();
                    this._bottomPocketSize = this._$bottomPocket.height();
                    this._scrollOffset = this._$container.height() - this._$content.height()
                },
                _allowedDirections: function() {
                    var allowedDirections = this.callBase();
                    allowedDirections.vertical = allowedDirections.vertical || this._pullDownEnabled;
                    return allowedDirections
                },
                _setTopPocketOffset: function() {
                    this._$topPocket.css({top: -this._topPocketSize})
                },
                handleEnd: function() {
                    this._complete()
                },
                handleStop: function() {
                    this._complete()
                },
                _complete: function() {
                    if (this._state === STATE_READY) {
                        this._setPullDownOffset(this._topPocketSize);
                        clearTimeout(this._pullDownRefreshTimeout);
                        this._pullDownRefreshTimeout = setTimeout($.proxy(function() {
                            this._pullDownRefreshing()
                        }, this), 400)
                    }
                },
                _setPullDownOffset: function(offset) {
                    DX.translator.move(this._$topPocket, {top: offset});
                    DX.translator.move(this._$scrollViewContent, {top: offset})
                },
                handleScroll: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._location = this.location().top;
                    if (this._isPullDown())
                        this._pullDownReady();
                    else if (this._isReachBottom())
                        this._reachBottom();
                    else
                        this._stateReleased()
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._location >= this._topPocketSize
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._scrollOffset + this._bottomPocketSize
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this.reachBottomCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY)
                        return;
                    this._state = STATE_READY;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._releaseState()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText();
                    this.pullDownCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled
                },
                pendingRelease: function() {
                    this._state = STATE_READY
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._updateDimensions();
                    clearTimeout(this._releaseTimeout);
                    this._releaseTimeout = setTimeout($.proxy(function() {
                        this._setPullDownOffset(0);
                        this._stateReleased();
                        this.releaseCallbacks.fire();
                        this._updateAction();
                        deferred.resolve()
                    }, this), 400);
                    return deferred.promise()
                },
                dispose: function() {
                    clearTimeout(this._pullDownRefreshTimeout);
                    clearTimeout(this._releaseTimeout);
                    this.callBase()
                }
            });
        ui.dxScrollView.refreshStrategies.pullDown = PullDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.native.swipeDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_OBSOLETE_ANDROID_CLASS = "dx-scrollview-obsolete-android-browser",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            PULLDOWN_HEIGHT = 160,
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3,
            STATE_TOUCHED = 4,
            STATE_PULLED = 5;
        var SwipeDownNativeScrollViewStrategy = ui.dxScrollable.NativeStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._$pullDown = scrollView._$pullDown;
                    this._$scrollViewContent = scrollView.content();
                    this._initCallbacks();
                    this._location = 0
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._releaseState()
                },
                _renderPullDown: function() {
                    var $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator({});
                    this._$image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS);
                    this._$pullDown.empty().append(this._$image).append($loadContainer.append($loadIndicator))
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._releasePullDown();
                    this._updateDimensions()
                },
                _releasePullDown: function() {
                    this._$pullDown.css({opacity: 0})
                },
                _updateDimensions: function() {
                    this.callBase();
                    this._topPocketSize = this._$topPocket.height();
                    this._bottomPocketSize = this._$bottomPocket.height();
                    this._scrollOffset = this._$container.height() - this._$content.height()
                },
                _allowedDirections: function() {
                    var allowedDirections = this.callBase();
                    allowedDirections.vertical = allowedDirections.vertical || this._pullDownEnabled;
                    return allowedDirections
                },
                handleInit: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_RELEASED && this._location === 0) {
                        this._startClientY = events.eventData(e.originalEvent).y;
                        this._state = STATE_TOUCHED
                    }
                },
                handleMove: function(e) {
                    this.callBase(e);
                    this._deltaY = events.eventData(e.originalEvent).y - this._startClientY;
                    if (this._state === STATE_TOUCHED)
                        if (this._pullDownEnabled && this._deltaY > 0)
                            this._state = STATE_PULLED;
                        else
                            this._complete();
                    if (this._state === STATE_PULLED) {
                        e.preventDefault();
                        this._movePullDown()
                    }
                },
                _movePullDown: function() {
                    var top = Math.min(this._getPullDownHeight() * 3 - this._getPullDownStartPosition(), this._deltaY + this._getPullDownStartPosition()),
                        angle = 180 * top / this._getPullDownHeight() / 3;
                    this._$pullDown.css({opacity: 1});
                    DX.translator.move(this._$pullDown, {top: top});
                    this._$image.css({transform: "rotate(" + angle + "deg)"})
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._deltaY >= this._getPullDownHeight() - this._getPullDownStartPosition()
                },
                _getPullDownHeight: function() {
                    return Math.round(this._$element.outerHeight() * 0.1)
                },
                _getPullDownStartPosition: function() {
                    return -Math.round(this._$pullDown.outerHeight() * 1.5)
                },
                handleEnd: function() {
                    if (this._isPullDown())
                        this._pullDownRefreshing();
                    this._complete()
                },
                handleStop: function() {
                    this._complete()
                },
                _complete: function() {
                    if (this._state === STATE_TOUCHED || this._state === STATE_PULLED)
                        this._releaseState()
                },
                handleScroll: function(e) {
                    this.callBase(e);
                    if (this._state === STATE_REFRESHING)
                        return;
                    var currentLocation = this.location().top,
                        scrollDelta = this._location - currentLocation;
                    this._location = currentLocation;
                    if (scrollDelta > 0 && this._isReachBottom())
                        this._reachBottom();
                    else
                        this._stateReleased()
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._scrollOffset + this._bottomPocketSize
                },
                _reachBottom: function() {
                    this.reachBottomCallbacks.fire()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                    this._releaseState()
                },
                _pullDownRefreshing: function() {
                    this._state = STATE_REFRESHING;
                    this._pullDownRefreshHandler()
                },
                _pullDownRefreshHandler: function() {
                    this._refreshPullDown();
                    this.pullDownCallbacks.fire()
                },
                _refreshPullDown: function() {
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS);
                    DX.translator.move(this._$pullDown, {top: this._getPullDownHeight() - this._getPullDownStartPosition()})
                },
                pullDownEnable: function(enabled) {
                    this._$topPocket.toggle(enabled);
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled
                },
                pendingRelease: function() {
                    this._state = STATE_READY
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._updateDimensions();
                    clearTimeout(this._releaseTimeout);
                    this._releaseTimeout = setTimeout($.proxy(function() {
                        this._stateReleased();
                        this.releaseCallbacks.fire();
                        this._updateAction();
                        deferred.resolve()
                    }, this), 800);
                    return deferred.promise()
                },
                dispose: function() {
                    clearTimeout(this._pullDownRefreshTimeout);
                    clearTimeout(this._releaseTimeout);
                    this.callBase()
                }
            });
        ui.dxScrollView.refreshStrategies.swipeDown = SwipeDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.native.slideDown.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var DX_SLIDE_DOWN_NATIVE_SCROLLVIEW_STRATEGY = "dxSlideDownNativeScrollViewStrategy",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_LOADING = 2,
            LOADING_HEIGHT = 80;
        var SlideDownNativeScrollViewStrategy = ui.dxScrollable.NativeStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this.callBase();
                    this._renderPullDown();
                    this._renderBottom();
                    this._releaseState();
                    this._updateDimensions()
                },
                _renderPullDown: function() {
                    this._$topPocket.empty()
                },
                _renderBottom: function() {
                    this._$bottomPocket.empty().append("<progress>")
                },
                _releaseState: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._state = STATE_RELEASED
                },
                _updateDimensions: function() {
                    this._scrollOffset = this._$container.prop("scrollHeight") - this._$container.prop("clientHeight");
                    this._containerSize = {
                        height: this._$container.prop("clientHeight"),
                        width: this._$container.prop("clientWidth")
                    };
                    this._contentSize = this._componentContentSize = {
                        height: this._$container.prop("scrollHeight"),
                        width: this._$container.prop("scrollWidth")
                    }
                },
                handleScroll: function(e) {
                    this.callBase(e);
                    if (this._isReachBottom(this._lastLocation.top))
                        this._reachBottom()
                },
                _isReachBottom: function(location) {
                    this._scrollContent = this._$container.prop("scrollHeight") - this._$container.prop("clientHeight");
                    return this._reachBottomEnabled && location < -this._scrollContent + LOADING_HEIGHT
                },
                _reachBottom: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this.reachBottomCallbacks.fire()
                },
                pullDownEnable: function(enabled) {
                    this._pullDownEnabled = enabled
                },
                reachBottomEnable: function(enabled) {
                    this._reachBottomEnabled = enabled;
                    this._$bottomPocket.toggle(enabled)
                },
                pendingRelease: function() {
                    this._state = STATE_READY
                },
                release: function() {
                    var deferred = $.Deferred();
                    this._state = STATE_RELEASED;
                    this.releaseCallbacks.fire();
                    this.update();
                    return deferred.resolve().promise()
                }
            });
        ui.dxScrollView.refreshStrategies.slideDown = SlideDownNativeScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.scrollView.simulated.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math;
        var SCROLLVIEW_PULLDOWN_REFRESHING_CLASS = "dx-scrollview-pull-down-loading",
            SCROLLVIEW_PULLDOWN_READY_CLASS = "dx-scrollview-pull-down-ready",
            SCROLLVIEW_PULLDOWN_IMAGE_CLASS = "dx-scrollview-pull-down-image",
            SCROLLVIEW_PULLDOWN_INDICATOR_CLASS = "dx-scrollview-pull-down-indicator",
            SCROLLVIEW_PULLDOWN_TEXT_CLASS = "dx-scrollview-pull-down-text",
            STATE_RELEASED = 0,
            STATE_READY = 1,
            STATE_REFRESHING = 2,
            STATE_LOADING = 3;
        var ScrollViewScroller = ui.dxScrollView.Scroller = ui.dxScrollable.Scroller.inherit({
                ctor: function() {
                    this.callBase.apply(this, arguments);
                    this._initCallbacks();
                    this._releaseState()
                },
                _releaseState: function() {
                    this._state = STATE_RELEASED;
                    this._refreshPullDownText()
                },
                _refreshPullDownText: function() {
                    this._$pullingDownText.css("opacity", this._state === STATE_RELEASED ? 1 : 0);
                    this._$pulledDownText.css("opacity", this._state === STATE_READY ? 1 : 0);
                    this._$refreshingText.css("opacity", this._state === STATE_REFRESHING ? 1 : 0)
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                _updateBounds: function() {
                    var considerPockets = this._direction !== "horizontal";
                    this._topPocketSize = considerPockets ? this._$topPocket[this._dimension]() : 0;
                    this._bottomPocketSize = considerPockets ? this._$bottomPocket[this._dimension]() : 0;
                    this.callBase();
                    this._bottomBound = this._minOffset
                },
                _updateScrollbar: function() {
                    this._scrollbar.option({
                        containerSize: this._containerSize(),
                        contentSize: this._contentSize() - this._topPocketSize - this._bottomPocketSize
                    })
                },
                _moveContent: function() {
                    this.callBase();
                    if (this._isPullDown())
                        this._pullDownReady();
                    else if (this._isReachBottom())
                        this._reachBottomReady();
                    else if (this._state !== STATE_RELEASED)
                        this._stateReleased()
                },
                _moveScrollbar: function() {
                    this._scrollbar.moveTo(this._topPocketSize + this._location)
                },
                _isPullDown: function() {
                    return this._pullDownEnabled && this._location >= 0
                },
                _isReachBottom: function() {
                    return this._reachBottomEnabled && this._location <= this._bottomBound
                },
                _scrollComplete: function() {
                    if (this._inBounds() && this._state === STATE_READY)
                        this._pullDownRefreshing();
                    else if (this._inBounds() && this._state === STATE_LOADING)
                        this._reachBottomLoading();
                    else
                        this.callBase()
                },
                _reachBottomReady: function() {
                    if (this._state === STATE_LOADING)
                        return;
                    this._state = STATE_LOADING;
                    this._minOffset = this._getMinOffset()
                },
                _getMaxOffset: function() {
                    return -this._topPocketSize
                },
                _getMinOffset: function() {
                    return math.min(this.callBase(), -this._topPocketSize)
                },
                _reachBottomLoading: function() {
                    this.reachBottomCallbacks.fire()
                },
                _pullDownReady: function() {
                    if (this._state === STATE_READY)
                        return;
                    this._state = STATE_READY;
                    this._maxOffset = 0;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText()
                },
                _stateReleased: function() {
                    if (this._state === STATE_RELEASED)
                        return;
                    this._releaseState();
                    this._updateBounds();
                    this._$pullDown.removeClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this.releaseCallbacks.fire()
                },
                _pullDownRefreshing: function() {
                    if (this._state === STATE_REFRESHING)
                        return;
                    this._state = STATE_REFRESHING;
                    this._$pullDown.addClass(SCROLLVIEW_PULLDOWN_REFRESHING_CLASS).removeClass(SCROLLVIEW_PULLDOWN_READY_CLASS);
                    this._refreshPullDownText();
                    this.pullDownCallbacks.fire()
                },
                _releaseHandler: function() {
                    if (this._state === STATE_RELEASED)
                        this._moveToBounds();
                    this._update();
                    if (this._releaseTask)
                        this._releaseTask.abort();
                    this._releaseTask = DX.utils.executeAsync($.proxy(this._release, this));
                    return this._releaseTask.promise
                },
                _release: function() {
                    this._stateReleased();
                    this._scrollComplete()
                },
                _reachBottomEnablingHandler: function(enabled) {
                    if (this._reachBottomEnabled === enabled)
                        return;
                    this._reachBottomEnabled = enabled;
                    this._updateBounds()
                },
                _pullDownEnablingHandler: function(enabled) {
                    if (this._pullDownEnabled === enabled)
                        return;
                    this._pullDownEnabled = enabled;
                    this._considerTopPocketChange();
                    this._updateHandler()
                },
                _considerTopPocketChange: function() {
                    this._location -= this._$topPocket.height() || -this._topPocketSize;
                    this._move()
                },
                _pendingReleaseHandler: function() {
                    this._state = STATE_READY
                },
                dispose: function() {
                    if (this._releaseTask)
                        this._releaseTask.abort();
                    this.callBase()
                }
            });
        var SimulatedScrollViewStrategy = ui.dxScrollable.SimulatedStrategy.inherit({
                _init: function(scrollView) {
                    this.callBase(scrollView);
                    this._$pullDown = scrollView._$pullDown;
                    this._$topPocket = scrollView._$topPocket;
                    this._$bottomPocket = scrollView._$bottomPocket;
                    this._initCallbacks()
                },
                _initCallbacks: function() {
                    this.pullDownCallbacks = $.Callbacks();
                    this.releaseCallbacks = $.Callbacks();
                    this.reachBottomCallbacks = $.Callbacks()
                },
                render: function() {
                    this._renderPullDown();
                    this.callBase()
                },
                _renderPullDown: function() {
                    var $image = $("<div>").addClass(SCROLLVIEW_PULLDOWN_IMAGE_CLASS),
                        $loadContainer = $("<div>").addClass(SCROLLVIEW_PULLDOWN_INDICATOR_CLASS),
                        $loadIndicator = $("<div>").dxLoadIndicator(),
                        $text = this._$pullDownText = $("<div>").addClass(SCROLLVIEW_PULLDOWN_TEXT_CLASS);
                    this._$pullingDownText = $("<div>").text(this.option("pullingDownText")).appendTo($text);
                    this._$pulledDownText = $("<div>").text(this.option("pulledDownText")).appendTo($text);
                    this._$refreshingText = $("<div>").text(this.option("refreshingText")).appendTo($text);
                    this._$pullDown.empty().append($image).append($loadContainer.append($loadIndicator)).append($text)
                },
                pullDownEnable: function(enabled) {
                    this._eventHandler("pullDownEnabling", enabled)
                },
                reachBottomEnable: function(enabled) {
                    this._eventHandler("reachBottomEnabling", enabled)
                },
                _createScroller: function(direction) {
                    var that = this;
                    var scroller = that._scrollers[direction] = new ScrollViewScroller(that._scrollerOptions(direction));
                    scroller.pullDownCallbacks.add(function() {
                        that.pullDownCallbacks.fire()
                    });
                    scroller.releaseCallbacks.add(function() {
                        that.releaseCallbacks.fire()
                    });
                    scroller.reachBottomCallbacks.add(function() {
                        that.reachBottomCallbacks.fire()
                    })
                },
                _scrollerOptions: function(direction) {
                    return $.extend(this.callBase(direction), {
                            $topPocket: this._$topPocket,
                            $bottomPocket: this._$bottomPocket,
                            $pullDown: this._$pullDown,
                            $pullDownText: this._$pullDownText,
                            $pullingDownText: this._$pullingDownText,
                            $pulledDownText: this._$pulledDownText,
                            $refreshingText: this._$refreshingText
                        })
                },
                pendingRelease: function() {
                    this._eventHandler("pendingRelease")
                },
                release: function() {
                    return this._eventHandler("release").done(this._updateAction)
                },
                location: function() {
                    var location = this.callBase();
                    location.top += this._$topPocket.height();
                    return location
                },
                dispose: function() {
                    $.each(this._scrollers, function() {
                        this.dispose()
                    });
                    this.callBase()
                }
            });
        ui.dxScrollView.refreshStrategies.simulated = SimulatedScrollViewStrategy
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils,
            winJS = DX.support.winJS,
            wrapToArray = utils.wrapToArray,
            removeDublicates = utils.removeDublicates,
            titleize = DX.inflector.titleize;
        var MAP_CLASS = "dx-map",
            MAP_CONTAINER_CLASS = "dx-map-container",
            MAP_SHIELD_CLASS = "dx-map-shield";
        DX.registerComponent("dxMap", ui, ui.Widget.inherit({
            ctor: function() {
                this.callBase.apply(this, arguments);
                this.addMarker = $.proxy(this._addFunction, this, "markers");
                this.removeMarker = $.proxy(this._removeFunction, this, "markers");
                this.addRoute = $.proxy(this._addFunction, this, "routes");
                this.removeRoute = $.proxy(this._removeFunction, this, "routes")
            },
            _addFunction: function(optionName, addingValue) {
                var deferred = $.Deferred(),
                    that = this,
                    providerDeffered = $.Deferred(),
                    optionValue = this.option(optionName),
                    addingValues = wrapToArray(addingValue);
                optionValue.push.apply(optionValue, addingValues);
                this._notificationDeffered = providerDeffered;
                this.option(optionName, optionValue);
                providerDeffered.done(function(instance) {
                    deferred.resolveWith(that, instance && instance.length > 1 ? [instance] : instance)
                });
                return deferred.promise()
            },
            _removeFunction: function(optionName, removingValue) {
                var deferred = $.Deferred(),
                    that = this,
                    providerDeffered = $.Deferred(),
                    optionValue = this.option(optionName),
                    removingValues = wrapToArray(removingValue);
                $.each(removingValues, function(_, removingValue) {
                    var index = $.isNumeric(removingValue) ? removingValue : $.inArray(removingValue, optionValue);
                    if (index !== -1)
                        optionValue.splice(index, 1);
                    else
                        throw DX.log("E1021", titleize(optionName.substring(0, optionName.length - 1)), removingValue);
                });
                this._notificationDeffered = providerDeffered;
                this.option(optionName, optionValue);
                providerDeffered.done(function() {
                    deferred.resolveWith(that)
                });
                return deferred.promise()
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    markerAddedAction: {
                        since: "14.2",
                        alias: "onMarkerAdded"
                    },
                    markerRemovedAction: {
                        since: "14.2",
                        alias: "onMarkerRemoved"
                    },
                    readyAction: {
                        since: "14.2",
                        alias: "onReady"
                    },
                    routeAddedAction: {
                        since: "14.2",
                        alias: "onRouteAdded"
                    },
                    routeRemovedAction: {
                        since: "14.2",
                        alias: "onRouteRemoved"
                    },
                    clickAction: {
                        since: "14.2",
                        alias: "onClick"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    bounds: {
                        northEast: null,
                        southWest: null
                    },
                    center: {
                        lat: 0,
                        lng: 0
                    },
                    zoom: 1,
                    width: 300,
                    height: 300,
                    type: "roadmap",
                    provider: "google",
                    autoAdjust: true,
                    markers: [],
                    markerIconSrc: null,
                    onMarkerAdded: null,
                    onMarkerRemoved: null,
                    routes: [],
                    onRouteAdded: null,
                    onRouteRemoved: null,
                    key: {
                        bing: "",
                        google: "",
                        googleStatic: ""
                    },
                    controls: false,
                    onReady: null,
                    onUpdated: null,
                    onClick: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this._asyncQueue = [];
                this._checkProvider();
                this._checkMarkersOption(this.option("markers"));
                this._checkRoutesOption(this.option("routes"));
                this._initContainer();
                this._grabEvents();
                this._cleanRenderedMarkers();
                this._cleanRenderedRoutes()
            },
            _checkProvider: function() {
                if (winJS && this.option("provider") === "google")
                    throw DX.Error("E1024");
            },
            _checkMarkersOption: function(markers) {
                if (!$.isArray(markers))
                    throw DX.Error("E1022");
            },
            _checkRoutesOption: function(routes) {
                if (!$.isArray(routes))
                    throw DX.Error("E1023");
            },
            _initContainer: function() {
                this._$container = $("<div />").addClass(MAP_CONTAINER_CLASS);
                this.element().append(this._$container)
            },
            _grabEvents: function() {
                var eventName = events.addNamespace("dxpointerdown", this.NAME);
                this.element().on(eventName, $.proxy(this._cancelEvent, this))
            },
            _cancelEvent: function(e) {
                var cancelByProvider = this._provider.cancelEvents && !this.option("disabled");
                if (!DX.designMode && cancelByProvider)
                    e.stopPropagation()
            },
            _cleanRenderedMarkers: function() {
                this._renderedMarkers = []
            },
            _cleanRenderedRoutes: function(routes) {
                this._renderedRoutes = []
            },
            _render: function() {
                this.callBase();
                this.element().addClass(MAP_CLASS);
                this._renderShield();
                this._queueAsyncAction("render", this.option("markers"), this.option("routes"));
                this._saveRenderedMarkers();
                this._saveRenderedRoutes()
            },
            _saveRenderedMarkers: function(markers) {
                markers = markers || this.option("markers");
                this._renderedMarkers = markers.slice()
            },
            _saveRenderedRoutes: function(routes) {
                routes = routes || this.option("routes");
                this._renderedRoutes = routes.slice()
            },
            _renderShield: function() {
                if (DX.designMode || this.option("disabled")) {
                    var $shield = $("<div/>").addClass(MAP_SHIELD_CLASS);
                    this.element().append($shield)
                }
                else {
                    var $shield = this.element().find("." + MAP_SHIELD_CLASS);
                    $shield.remove()
                }
            },
            _clean: function() {
                this._cleanFocusState();
                if (!this._provider)
                    return;
                this._queueAsyncAction("clean");
                this._cleanRenderedMarkers();
                this._cleanRenderedRoutes()
            },
            _optionChanged: function(args) {
                var value = args.value;
                var previousValue = args.previousValue;
                if (this._cancelOptionChange)
                    return;
                var notificationDeffered = this._notificationDeffered;
                delete this._notificationDeffered;
                switch (args.name) {
                    case"disabled":
                        this._renderShield();
                        this.callBase(args);
                        break;
                    case"width":
                    case"height":
                        this.callBase(args);
                        this._dimensionChanged();
                        break;
                    case"provider":
                        this._invalidate();
                        break;
                    case"key":
                        DX.log("W1001");
                        break;
                    case"bounds":
                        this._queueAsyncAction("updateBounds");
                        break;
                    case"center":
                        this._queueAsyncAction("updateCenter");
                        break;
                    case"zoom":
                        this._queueAsyncAction("updateZoom");
                        break;
                    case"type":
                        this._queueAsyncAction("updateMapType");
                        break;
                    case"controls":
                        this._queueAsyncAction("updateControls", this.option("markers"), this.option("routes"));
                        break;
                    case"autoAdjust":
                        this._queueAsyncAction("adjustViewport");
                        break;
                    case"markers":
                        this._checkMarkersOption(value);
                        this._queueAsyncAction("updateMarkers", notificationDeffered ? removeDublicates(this._renderedMarkers, value) : this._renderedMarkers, notificationDeffered ? removeDublicates(value, this._renderedMarkers) : value).done($.proxy(function() {
                            if (notificationDeffered)
                                notificationDeffered.resolve.apply(notificationDeffered, arguments)
                        }, this));
                        this._saveRenderedMarkers(value);
                        break;
                    case"markerIconSrc":
                        this._queueAsyncAction("updateMarkers", this._renderedMarkers, this._renderedMarkers);
                        break;
                    case"routes":
                        this._checkRoutesOption(value);
                        this._queueAsyncAction("updateRoutes", notificationDeffered ? removeDublicates(this._renderedRoutes, value) : this._renderedRoutes, notificationDeffered ? removeDublicates(value, this._renderedRoutes) : value).done($.proxy(function() {
                            if (notificationDeffered)
                                notificationDeffered.resolve.apply(notificationDeffered, arguments)
                        }, this));
                        this._saveRenderedRoutes(value);
                        break;
                    case"onReady":
                    case"onUpdated":
                    case"onMarkerAdded":
                    case"onMarkerRemoved":
                    case"onRouteAdded":
                    case"onRouteRemoved":
                    case"onClick":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._queueAsyncAction("updateDimensions")
            },
            _queueAsyncAction: function(name) {
                var deferred = $.Deferred(),
                    emptyQueue = !this._asyncQueue.length;
                this._asyncQueue.push({
                    name: name,
                    options: $.makeArray(arguments).slice(1),
                    deferred: deferred
                });
                if (emptyQueue)
                    this._enqueueAsyncAction();
                return deferred.promise()
            },
            _enqueueAsyncAction: function() {
                var emptyQueue = !this._asyncQueue.length;
                if (emptyQueue)
                    return;
                this._execAsyncAction(this._asyncQueue[0]).done($.proxy(function() {
                    this._asyncQueue.shift();
                    this._enqueueAsyncAction()
                }, this))
            },
            _execAsyncAction: function(action) {
                var deferred = $.Deferred(),
                    actionName = action.name,
                    actionOptions = action.options,
                    actionDeferred = action.deferred,
                    provider = this._getProvider(actionName);
                provider[actionName].apply(provider, actionOptions).done($.proxy(function(mapRefreshed) {
                    actionDeferred.resolve.apply(actionDeferred, $.makeArray(arguments).slice(1));
                    if (mapRefreshed)
                        this._triggerReadyAction();
                    else if (actionName !== "clean")
                        this._triggerUpdateAction();
                    deferred.resolve()
                }, this));
                return deferred.promise()
            },
            _getProvider: function(actionName) {
                var currentProvider = this.option("provider");
                if (actionName !== "clean" && this._usedProvider !== currentProvider) {
                    this._provider = new providers[currentProvider](this, this._$container);
                    this._usedProvider = currentProvider
                }
                return this._provider
            },
            _triggerReadyAction: function() {
                this._createActionByOption("onReady")({originalMap: this._provider.map()})
            },
            _triggerUpdateAction: function() {
                this._createActionByOption("onUpdated")()
            },
            setOptionSilent: function(name, value) {
                this._cancelOptionChange = true;
                this.option(name, value);
                this._cancelOptionChange = false
            }
        }));
        var providers = {};
        ui.dxMap.registerProvider = function(name, provider) {
            providers[name] = provider
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.provider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        ui.dxMap.Provider = DX.Class.inherit({
            _defaultRouteWeight: function() {
                return 5
            },
            _defaultRouteOpacity: function() {
                return .5
            },
            _defaultRouteColor: function() {
                return "#0000FF"
            },
            cancelEvents: false,
            ctor: function(map, $container) {
                this._mapWidget = map;
                this._$container = $container
            },
            render: function(markerOptions, routeOptions) {
                var deferred = $.Deferred();
                this._renderImpl().done($.proxy(function() {
                    var markersPromise = this.addMarkers(markerOptions);
                    var routesPromise = this.addRoutes(routeOptions);
                    $.when(markersPromise, routesPromise).done(function() {
                        deferred.resolve(true)
                    })
                }, this));
                return deferred.promise()
            },
            _renderImpl: DX.abstract,
            updateDimensions: DX.abstract,
            updateMapType: DX.abstract,
            updateBounds: DX.abstract,
            updateCenter: DX.abstract,
            updateZoom: DX.abstract,
            updateControls: DX.abstract,
            updateMarkers: function(markerOptionsToRemove, markerOptionsToAdd) {
                var deferred = $.Deferred(),
                    that = this;
                this.removeMarkers(markerOptionsToRemove).done(function() {
                    that.addMarkers(markerOptionsToAdd).done(function() {
                        deferred.resolve.apply(deferred, arguments)
                    })
                });
                return deferred.promise()
            },
            addMarkers: DX.abstract,
            removeMarkers: DX.abstract,
            adjustViewport: DX.abstract,
            updateRoutes: function(routeOptionsToRemove, routeOptionsToAdd) {
                var deferred = $.Deferred(),
                    that = this;
                this.removeRoutes(routeOptionsToRemove).done(function() {
                    that.addRoutes(routeOptionsToAdd).done(function() {
                        deferred.resolve.apply(deferred, arguments)
                    })
                });
                return deferred.promise()
            },
            addRoutes: DX.abstract,
            removeRoutes: DX.abstract,
            clean: DX.abstract,
            map: function() {
                return this._map
            },
            _option: function(name, value) {
                if (value === undefined)
                    return this._mapWidget.option(name);
                this._mapWidget.setOptionSilent(name, value)
            },
            _keyOption: function(providerName) {
                var key = this._option("key");
                return key[providerName] === undefined ? key : key[providerName]
            },
            _parseTooltipOptions: function(option) {
                return {
                        text: option.text || option,
                        visible: option.isShown || false
                    }
            },
            _getLatLng: function(location) {
                if (typeof location === "string") {
                    var coords = $.map(location.split(","), $.trim),
                        numericRegex = /[-+]?[0-9]*\.?[0-9]*/;
                    if (coords.length === 2 && coords[0].match(numericRegex) && coords[1].match(numericRegex))
                        return {
                                lat: parseFloat(coords[0]),
                                lng: parseFloat(coords[1])
                            }
                }
                else if ($.isArray(location) && location.length === 2)
                    return {
                            lat: location[0],
                            lng: location[1]
                        };
                else if ($.isPlainObject(location) && $.isNumeric(location.lat) && $.isNumeric(location.lng))
                    return location;
                return null
            },
            _isBoundsSetted: function() {
                return this._option("bounds.northEast") && this._option("bounds.southWest")
            },
            _addEventNamespace: function(name) {
                return events.addNamespace(name, this._mapWidget.NAME)
            },
            _createAction: function() {
                var mapWidget = this._mapWidget;
                return mapWidget._createAction.apply(mapWidget, arguments)
            },
            _fireAction: function(name, actionArguments) {
                var option = this._option(name);
                if (option)
                    this._createAction(option)(actionArguments)
            },
            _fireClickAction: function(actionArguments) {
                this._fireAction("onClick", actionArguments)
            },
            _fireMarkerAddedAction: function(actionArguments) {
                this._fireAction("onMarkerAdded", actionArguments)
            },
            _fireMarkerRemovedAction: function(actionArguments) {
                this._fireAction("onMarkerRemoved", actionArguments)
            },
            _fireRouteAddedAction: function(actionArguments) {
                this._fireAction("onRouteAdded", actionArguments)
            },
            _fireRouteRemovedAction: function(actionArguments) {
                this._fireAction("onRouteRemoved", actionArguments)
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.provider.googleStatic.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var GOOGLE_STATIC_URL = "https://maps.google.com/maps/api/staticmap?";
        ui.dxMap.registerProvider("googleStatic", ui.dxMap.Provider.inherit({
            _locationToString: function(location) {
                var latlng = this._getLatLng(location);
                return latlng ? latlng.lat + "," + latlng.lng : location.toString().replace(/ /g, "+")
            },
            _renderImpl: function() {
                return this._updateMap()
            },
            updateDimensions: function() {
                return this._updateMap()
            },
            updateMapType: function() {
                return this._updateMap()
            },
            updateBounds: function() {
                return $.Deferred().resolve().promise()
            },
            updateCenter: function() {
                return this._updateMap()
            },
            updateZoom: function() {
                return this._updateMap()
            },
            updateControls: function() {
                return $.Deferred().resolve().promise()
            },
            addMarkers: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireMarkerAddedAction({options: options})
                        })
                    })
            },
            removeMarkers: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireMarkerRemovedAction({options: options})
                        })
                    })
            },
            adjustViewport: function() {
                return $.Deferred().resolve().promise()
            },
            addRoutes: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireRouteAddedAction({options: options})
                        })
                    })
            },
            removeRoutes: function(options) {
                var that = this;
                return this._updateMap().done(function() {
                        $.each(options, function(_, options) {
                            that._fireRouteRemovedAction({options: options})
                        })
                    })
            },
            clean: function() {
                this._$container.css("background-image", "none");
                this._$container.off(this._addEventNamespace("dxclick"));
                return $.Deferred().resolve().promise()
            },
            mapRendered: function() {
                return true
            },
            _updateMap: function() {
                var key = this._keyOption("googleStatic"),
                    $container = this._$container;
                var requestOptions = ["sensor=false", "size=" + $container.width() + "x" + $container.height(), "maptype=" + this._option("type"), "center=" + this._locationToString(this._option("center")), "zoom=" + this._option("zoom"), this._markersSubstring()];
                requestOptions.push.apply(requestOptions, this._routeSubstrings());
                if (key)
                    requestOptions.push("key=" + key);
                var request = GOOGLE_STATIC_URL + requestOptions.join("&");
                this._$container.css("background", "url(\"" + request + "\") no-repeat 0 0");
                this._attachClickEvent();
                return $.Deferred().resolve(true).promise()
            },
            _markersSubstring: function() {
                var that = this,
                    markers = [],
                    markerIcon = this._option("markerIconSrc");
                if (markerIcon)
                    markers.push("icon:" + markerIcon);
                $.each(this._option("markers"), function(_, marker) {
                    markers.push(that._locationToString(marker.location))
                });
                return "markers=" + markers.join("|")
            },
            _routeSubstrings: function() {
                var that = this,
                    routes = [];
                $.each(this._option("routes"), function(_, route) {
                    var color = new DX.Color(route.color || that._defaultRouteColor()).toHex().replace('#', '0x'),
                        opacity = Math.round((route.opacity || that._defaultRouteOpacity()) * 255).toString(16),
                        width = route.weight || that._defaultRouteWeight(),
                        locations = [];
                    $.each(route.locations, function(_, routePoint) {
                        locations.push(that._locationToString(routePoint))
                    });
                    routes.push("path=color:" + color + opacity + "|weight:" + width + "|" + locations.join("|"))
                });
                return routes
            },
            _attachClickEvent: function() {
                var that = this,
                    eventName = this._addEventNamespace("dxclick");
                this._$container.off(eventName).on(eventName, function(e) {
                    that._fireClickAction({jQueryEvent: e})
                })
            }
        }));
        ui.dxMap.__internals = $.extend(ui.dxMap.__internals, {remapGoogleStaticConstant: function(newValue) {
                GOOGLE_STATIC_URL = newValue
            }})
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.provider.dynamic.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        ui.dxMap.DynamicProvider = ui.dxMap.Provider.inherit({
            cancelEvents: true,
            _renderImpl: function(markerOptions, routeOptions) {
                var deferred = $.Deferred();
                this._load().done($.proxy(function() {
                    this._init().done($.proxy(function() {
                        var mapTypePromise = this.updateMapType(),
                            boundsPromise = this._isBoundsSetted() ? this.updateBounds() : this.updateCenter();
                        $.when(mapTypePromise, boundsPromise).done($.proxy(function() {
                            this._attachHandlers();
                            setTimeout(function() {
                                deferred.resolve()
                            })
                        }, this))
                    }, this))
                }, this));
                return deferred.promise()
            },
            _load: function() {
                if (!this._mapsLoader) {
                    this._mapsLoader = $.Deferred();
                    this._loadImpl().done($.proxy(function() {
                        this._mapsLoader.resolve()
                    }, this))
                }
                this._markers = [];
                this._routes = [];
                return this._mapsLoader.promise()
            },
            _loadImpl: DX.abstract,
            _init: DX.abstract,
            _attachHandlers: DX.abstract,
            addMarkers: function(options) {
                var deferred = $.Deferred(),
                    that = this;
                var markerPromises = $.map(options, function(options) {
                        return that._addMarker(options)
                    });
                $.when.apply($, markerPromises).done(function() {
                    var instances = $.map($.makeArray(arguments), function(markerObject) {
                            return markerObject.marker
                        });
                    deferred.resolve(false, instances)
                });
                return deferred.promise()
            },
            _addMarker: function(options) {
                var that = this;
                return this._renderMarker(options).done(function(markerObject) {
                        that._markers.push($.extend({options: options}, markerObject));
                        that._fitBounds();
                        that._fireMarkerAddedAction({
                            options: options,
                            originalMarker: markerObject.marker
                        })
                    })
            },
            _renderMarker: DX.abstract,
            removeMarkers: function(markersOptionsToRemove) {
                var that = this;
                $.each(markersOptionsToRemove, function(_, markerOptionToRemove) {
                    that._removeMarker(markerOptionToRemove)
                });
                return $.Deferred().resolve().promise()
            },
            _removeMarker: function(markersOptionToRemove) {
                var that = this;
                $.each(this._markers, function(markerIndex, markerObject) {
                    if (markerObject.options !== markersOptionToRemove)
                        return true;
                    that._destroyMarker(markerObject);
                    that._markers.splice(markerIndex, 1);
                    that._fireMarkerRemovedAction({options: markerObject.options});
                    return false
                })
            },
            _destroyMarker: DX.abstract,
            _clearMarkers: function() {
                for (var i = 0; this._markers.length > 0; )
                    this._removeMarker(this._markers[0].options)
            },
            addRoutes: function(options) {
                var deferred = $.Deferred(),
                    that = this;
                var routePromises = $.map(options, function(options) {
                        return that._addRoute(options)
                    });
                $.when.apply($, routePromises).done(function() {
                    var instances = $.map($.makeArray(arguments), function(routeObject) {
                            return routeObject.instance
                        });
                    deferred.resolve(false, instances)
                });
                return deferred.promise()
            },
            _addRoute: function(options) {
                var that = this;
                return this._renderRoute(options).done(function(routeObject) {
                        that._routes.push($.extend({options: options}, routeObject));
                        that._fitBounds();
                        that._fireRouteAddedAction({
                            options: options,
                            originalRoute: routeObject.instance
                        })
                    })
            },
            _renderRoute: DX.abstract,
            removeRoutes: function(options) {
                var that = this;
                $.each(options, function(routeIndex, options) {
                    that._removeRoute(options)
                });
                return $.Deferred().resolve().promise()
            },
            _removeRoute: function(options) {
                var that = this;
                $.each(this._routes, function(routeIndex, routeObject) {
                    if (routeObject.options !== options)
                        return true;
                    that._destroyRoute(routeObject);
                    that._routes.splice(routeIndex, 1);
                    that._fireRouteRemovedAction({options: options});
                    return false
                })
            },
            _destroyRoute: DX.abstract,
            _clearRoutes: function() {
                for (var i = 0; this._routes.length > 0; )
                    this._removeRoute(this._routes[0].options)
            },
            adjustViewport: function() {
                return this._fitBounds()
            },
            _fitBounds: DX.abstract,
            _updateBounds: function() {
                var that = this;
                this._clearBounds();
                $.each(this._markers, function(_, markerObject) {
                    that._extendBounds(markerObject.location)
                });
                $.each(this._routes, function(_, routeObject) {
                    that._extendBounds(routeObject.northEast);
                    that._extendBounds(routeObject.southWest)
                })
            },
            _clearBounds: function() {
                this._bounds = null
            },
            _extendBounds: DX.abstract
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.provider.dynamic.bing.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            winJS = DX.support.winJS;
        var BING_MAP_READY = "_bingScriptReady",
            BING_URL = "https://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&s=1&onScriptLoad=" + BING_MAP_READY,
            BING_LOCAL_FILES1 = "ms-appx:///Bing.Maps.JavaScript/js/veapicore.js",
            BING_LOCAL_FILES2 = "ms-appx:///Bing.Maps.JavaScript/js/veapiModules.js",
            BING_CREDENTIALS = "AhuxC0dQ1DBTNo8L-H9ToVMQStmizZzBJdraTSgCzDSWPsA1Qd8uIvFSflzxdaLH",
            MIN_LOCATION_RECT_LENGTH = 0.0000000000000001;
        var msMapsLoaded = function() {
                return window.Microsoft && window.Microsoft.Maps
            };
        var msMapsLoader;
        ui.dxMap.registerProvider("bing", ui.dxMap.DynamicProvider.inherit({
            _mapType: function(type) {
                var mapTypes = {
                        roadmap: Microsoft.Maps.MapTypeId.road,
                        hybrid: Microsoft.Maps.MapTypeId.aerial,
                        satellite: Microsoft.Maps.MapTypeId.aerial
                    };
                return mapTypes[type] || mapTypes.road
            },
            _movementMode: function(type) {
                var movementTypes = {
                        driving: Microsoft.Maps.Directions.RouteMode.driving,
                        walking: Microsoft.Maps.Directions.RouteMode.walking
                    };
                return movementTypes[type] || movementTypes.driving
            },
            _resolveLocation: function(location) {
                var d = $.Deferred();
                var latLng = this._getLatLng(location);
                if (latLng)
                    d.resolve(new Microsoft.Maps.Location(latLng.lat, latLng.lng));
                else {
                    var searchManager = new Microsoft.Maps.Search.SearchManager(this._map);
                    var searchRequest = {
                            where: location,
                            count: 1,
                            callback: function(searchResponse) {
                                var boundsBox = searchResponse.results[0].location;
                                d.resolve(new Microsoft.Maps.Location(boundsBox.latitude, boundsBox.longitude))
                            }
                        };
                    searchManager.geocode(searchRequest)
                }
                return d.promise()
            },
            _normalizeLocation: function(location) {
                return {
                        lat: location.latitude,
                        lng: location.longitude
                    }
            },
            _normalizeLocationRect: function(locationRect) {
                var northWest = this._normalizeLocation(locationRect.getNorthwest()),
                    southEast = this._normalizeLocation(locationRect.getSoutheast());
                return {
                        northEast: {
                            lat: northWest.lat,
                            lng: southEast.lng
                        },
                        southWest: {
                            lat: southEast.lat,
                            lng: northWest.lng
                        }
                    }
            },
            _loadImpl: function() {
                this._msMapsLoader = $.Deferred();
                if (msMapsLoaded())
                    this._mapReady();
                else {
                    if (!msMapsLoader || msMapsLoader.state() == "resolved" && !msMapsLoaded()) {
                        msMapsLoader = $.Deferred();
                        window[BING_MAP_READY] = $.proxy(msMapsLoader.resolve, msMapsLoader);
                        if (winJS)
                            $.when($.getScript(BING_LOCAL_FILES1), $.getScript(BING_LOCAL_FILES2)).done(function() {
                                Microsoft.Maps.loadModule("Microsoft.Maps.Map", {callback: window[BING_MAP_READY]})
                            });
                        else
                            $.getScript(BING_URL)
                    }
                    msMapsLoader.done($.proxy(this._mapReady, this))
                }
                return this._msMapsLoader.promise()
            },
            _mapReady: function() {
                try {
                    delete window[BING_MAP_READY]
                }
                catch(e) {
                    window[BING_MAP_READY] = undefined
                }
                var searchModulePromise = $.Deferred();
                var directionsModulePromise = $.Deferred();
                Microsoft.Maps.loadModule('Microsoft.Maps.Search', {callback: $.proxy(searchModulePromise.resolve, searchModulePromise)});
                Microsoft.Maps.loadModule('Microsoft.Maps.Directions', {callback: $.proxy(directionsModulePromise.resolve, directionsModulePromise)});
                $.when(searchModulePromise, directionsModulePromise).done($.proxy(function() {
                    this._msMapsLoader.resolve()
                }, this))
            },
            _init: function() {
                var deferred = $.Deferred(),
                    initPromise = $.Deferred(),
                    controls = this._option("controls");
                this._map = new Microsoft.Maps.Map(this._$container[0], {
                    credentials: this._keyOption("bing") || BING_CREDENTIALS,
                    zoom: this._option("zoom"),
                    showDashboard: controls,
                    showMapTypeSelector: controls,
                    showScalebar: controls
                });
                var handler = Microsoft.Maps.Events.addHandler(this._map, 'tiledownloadcomplete', $.proxy(initPromise.resolve, initPromise));
                $.when(initPromise).done($.proxy(function() {
                    Microsoft.Maps.Events.removeHandler(handler);
                    deferred.resolve()
                }, this));
                return deferred.promise()
            },
            _attachHandlers: function() {
                this._providerViewChangeHandler = Microsoft.Maps.Events.addHandler(this._map, 'viewchange', $.proxy(this._viewChangeHandler, this));
                this._providerClickHandler = Microsoft.Maps.Events.addHandler(this._map, 'click', $.proxy(this._clickActionHandler, this))
            },
            _viewChangeHandler: function() {
                var bounds = this._map.getBounds();
                this._option("bounds", this._normalizeLocationRect(bounds));
                var center = this._map.getCenter();
                this._option("center", this._normalizeLocation(center));
                if (!this._preventZoomChangeEvent)
                    this._option("zoom", this._map.getZoom())
            },
            _clickActionHandler: function(e) {
                if (e.targetType == "map") {
                    var point = new Microsoft.Maps.Point(e.getX(), e.getY()),
                        location = e.target.tryPixelToLocation(point);
                    this._fireClickAction({location: this._normalizeLocation(location)})
                }
            },
            updateDimensions: function() {
                var $container = this._$container;
                this._map.setOptions({
                    width: $container.width(),
                    height: $container.height()
                });
                return $.Deferred().resolve().promise()
            },
            updateMapType: function() {
                var type = this._option("type"),
                    labelOverlay = Microsoft.Maps.LabelOverlay;
                this._map.setView({
                    animate: false,
                    mapTypeId: this._mapType(type),
                    labelOverlay: type == "satellite" ? labelOverlay.hidden : labelOverlay.visible
                });
                return $.Deferred().resolve().promise()
            },
            updateBounds: function() {
                var deferred = $.Deferred(),
                    that = this;
                var northEastPromise = this._resolveLocation(this._option("bounds.northEast")),
                    southWestPromise = this._resolveLocation(this._option("bounds.southWest"));
                $.when(northEastPromise, southWestPromise).done(function(northEast, southWest) {
                    var bounds = new Microsoft.Maps.LocationRect.fromLocations(northEast, southWest);
                    that._map.setView({
                        animate: false,
                        bounds: bounds
                    });
                    deferred.resolve()
                });
                return deferred.promise()
            },
            updateCenter: function() {
                var deferred = $.Deferred(),
                    that = this;
                this._resolveLocation(this._option("center")).done(function(location) {
                    that._map.setView({
                        animate: false,
                        center: location
                    });
                    deferred.resolve()
                });
                return deferred.promise()
            },
            updateZoom: function() {
                this._map.setView({
                    animate: false,
                    zoom: this._option("zoom")
                });
                return $.Deferred().resolve().promise()
            },
            updateControls: function() {
                this.clean();
                return this.render.apply(this, arguments)
            },
            _renderMarker: function(options) {
                var d = $.Deferred(),
                    that = this;
                this._resolveLocation(options.location).done(function(location) {
                    var pushpinOptions = {icon: options.iconSrc || that._option("markerIconSrc")};
                    if (options.html) {
                        $.extend(pushpinOptions, {
                            htmlContent: options.html,
                            width: null,
                            height: null
                        });
                        var htmlOffset = options.htmlOffset;
                        if (htmlOffset)
                            pushpinOptions.anchor = new Microsoft.Maps.Point(-htmlOffset.left, -htmlOffset.top)
                    }
                    var pushpin = new Microsoft.Maps.Pushpin(location, pushpinOptions);
                    that._map.entities.push(pushpin);
                    var infobox = that._renderTooltip(location, options.tooltip);
                    if (options.clickAction) {
                        DX.log("W0001", "dxMap", "marker.clickAction", "14.2", "Use 'onClick' option instead");
                        options.onClick = options.clickAction
                    }
                    var handler;
                    if (options.onClick || options.tooltip) {
                        var markerClickAction = that._createAction(options.onClick || $.noop),
                            markerNormalizedLocation = that._normalizeLocation(location);
                        handler = Microsoft.Maps.Events.addHandler(pushpin, "click", function() {
                            markerClickAction({location: markerNormalizedLocation});
                            if (infobox)
                                infobox.setOptions({visible: true})
                        })
                    }
                    d.resolve({
                        location: location,
                        marker: pushpin,
                        infobox: infobox,
                        handler: handler
                    })
                });
                return d.promise()
            },
            _renderTooltip: function(location, options) {
                if (!options)
                    return;
                options = this._parseTooltipOptions(options);
                var infobox = new Microsoft.Maps.Infobox(location, {
                        description: options.text,
                        offset: new Microsoft.Maps.Point(0, 33),
                        visible: options.visible
                    });
                this._map.entities.push(infobox, null);
                return infobox
            },
            _destroyMarker: function(marker) {
                this._map.entities.remove(marker.marker);
                if (marker.infobox)
                    this._map.entities.remove(marker.infobox);
                if (marker.handler)
                    Microsoft.Maps.Events.removeHandler(marker.handler)
            },
            _renderRoute: function(options) {
                var d = $.Deferred(),
                    that = this;
                var points = $.map(options.locations, function(point) {
                        return that._resolveLocation(point)
                    });
                $.when.apply($, points).done(function() {
                    var locations = $.makeArray(arguments),
                        direction = new Microsoft.Maps.Directions.DirectionsManager(that._map),
                        color = new DX.Color(options.color || that._defaultRouteColor()).toHex(),
                        routeColor = new Microsoft.Maps.Color.fromHex(color);
                    routeColor.a = (options.opacity || that._defaultRouteOpacity()) * 255;
                    direction.setRenderOptions({
                        autoUpdateMapView: false,
                        displayRouteSelector: false,
                        waypointPushpinOptions: {visible: false},
                        drivingPolylineOptions: {
                            strokeColor: routeColor,
                            strokeThickness: options.weight || that._defaultRouteWeight()
                        },
                        walkingPolylineOptions: {
                            strokeColor: routeColor,
                            strokeThickness: options.weight || that._defaultRouteWeight()
                        }
                    });
                    direction.setRequestOptions({
                        routeMode: that._movementMode(options.mode),
                        routeDraggable: false
                    });
                    $.each(locations, function(_, location) {
                        var waypoint = new Microsoft.Maps.Directions.Waypoint({location: location});
                        direction.addWaypoint(waypoint)
                    });
                    var handler = Microsoft.Maps.Events.addHandler(direction, 'directionsUpdated', function(args) {
                            Microsoft.Maps.Events.removeHandler(handler);
                            var routeSummary = args.routeSummary[0];
                            d.resolve({
                                instance: direction,
                                northEast: routeSummary.northEast,
                                southWest: routeSummary.southWest
                            })
                        });
                    direction.calculateDirections()
                });
                return d.promise()
            },
            _destroyRoute: function(routeObject) {
                routeObject.instance.dispose()
            },
            _fitBounds: function() {
                this._updateBounds();
                if (this._bounds && this._option("autoAdjust")) {
                    var zoomBeforeFitting = this._map.getZoom();
                    this._preventZoomChangeEvent = true;
                    var bounds = this._bounds.clone();
                    bounds.height = bounds.height * 1.1;
                    bounds.width = bounds.width * 1.1;
                    this._map.setView({
                        animate: false,
                        bounds: bounds,
                        zoom: zoomBeforeFitting
                    });
                    var zoomAfterFitting = this._map.getZoom();
                    if (zoomBeforeFitting < zoomAfterFitting)
                        this._map.setView({
                            animate: false,
                            zoom: zoomBeforeFitting
                        });
                    else
                        this._option("zoom", zoomAfterFitting);
                    delete this._preventZoomChangeEvent
                }
                return $.Deferred().resolve().promise()
            },
            _extendBounds: function(location) {
                if (this._bounds)
                    this._bounds = new Microsoft.Maps.LocationRect.fromLocations(this._bounds.getNorthwest(), this._bounds.getSoutheast(), location);
                else
                    this._bounds = new Microsoft.Maps.LocationRect(location, MIN_LOCATION_RECT_LENGTH, MIN_LOCATION_RECT_LENGTH)
            },
            clean: function() {
                if (this._map) {
                    Microsoft.Maps.Events.removeHandler(this._providerViewChangeHandler);
                    Microsoft.Maps.Events.removeHandler(this._providerClickHandler);
                    this._clearMarkers();
                    this._clearRoutes();
                    this._map.dispose()
                }
                return $.Deferred().resolve().promise()
            }
        }));
        ui.dxMap.__internals = $.extend(ui.dxMap.__internals, {remapBingConstant: function(newValue) {
                BING_URL = newValue
            }})
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.map.provider.dynamic.google.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var GOOGLE_MAP_READY = "_googleScriptReady",
            GOOGLE_URL = "https://maps.google.com/maps/api/js?v=3.18&sensor=false&callback=" + GOOGLE_MAP_READY;
        var CustomMarker;
        var initCustomMarkerClass = function() {
                CustomMarker = function(options) {
                    this._position = options.position;
                    this._offset = options.offset;
                    this._$overlayContainer = $("<div>").css({
                        position: "absolute",
                        display: "none",
                        cursor: "pointer"
                    }).append(options.html);
                    this.setMap(options.map)
                };
                CustomMarker.prototype = new google.maps.OverlayView;
                CustomMarker.prototype.onAdd = function() {
                    var $pane = $(this.getPanes().overlayMouseTarget);
                    $pane.append(this._$overlayContainer);
                    this._clickListner = google.maps.event.addDomListener(this._$overlayContainer.get(0), 'click', $.proxy(function(e) {
                        google.maps.event.trigger(this, 'click');
                        e.preventDefault()
                    }, this));
                    this.draw()
                };
                CustomMarker.prototype.onRemove = function() {
                    google.maps.event.removeListener(this._clickListner);
                    this._$overlayContainer.remove()
                };
                CustomMarker.prototype.draw = function() {
                    var position = this.getProjection().fromLatLngToDivPixel(this._position);
                    this._$overlayContainer.css({
                        left: position.x + this._offset.left,
                        top: position.y + this._offset.top,
                        display: 'block'
                    })
                }
            };
        var googleMapsLoaded = function() {
                return window.google && window.google.maps
            };
        var googleMapsLoader;
        ui.dxMap.registerProvider("google", ui.dxMap.DynamicProvider.inherit({
            _mapType: function(type) {
                var mapTypes = {
                        hybrid: google.maps.MapTypeId.HYBRID,
                        roadmap: google.maps.MapTypeId.ROADMAP,
                        satellite: google.maps.MapTypeId.SATELLITE
                    };
                return mapTypes[type] || mapTypes.hybrid
            },
            _movementMode: function(type) {
                var movementTypes = {
                        driving: google.maps.TravelMode.DRIVING,
                        walking: google.maps.TravelMode.WALKING
                    };
                return movementTypes[type] || movementTypes.driving
            },
            _resolveLocation: function(location) {
                var d = $.Deferred();
                var latLng = this._getLatLng(location);
                if (latLng)
                    d.resolve(new google.maps.LatLng(latLng.lat, latLng.lng));
                else {
                    var geocoder = new google.maps.Geocoder;
                    geocoder.geocode({address: location}, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK)
                            d.resolve(results[0].geometry.location)
                    })
                }
                return d.promise()
            },
            _normalizeLocation: function(location) {
                return {
                        lat: location.lat(),
                        lng: location.lng()
                    }
            },
            _normalizeLocationRect: function(locationRect) {
                return {
                        northEast: this._normalizeLocation(locationRect.getNorthEast()),
                        southWest: this._normalizeLocation(locationRect.getSouthWest())
                    }
            },
            _loadImpl: function() {
                this._googleMapsLoader = $.Deferred();
                if (googleMapsLoaded())
                    this._mapReady();
                else {
                    if (!googleMapsLoader || googleMapsLoader.state() == "resolved" && !googleMapsLoaded()) {
                        googleMapsLoader = $.Deferred();
                        var key = this._keyOption("google");
                        window[GOOGLE_MAP_READY] = $.proxy(googleMapsLoader.resolve, googleMapsLoader);
                        $.getScript(GOOGLE_URL + (key ? "&key=" + key : ""))
                    }
                    googleMapsLoader.done($.proxy(this._mapReady, this))
                }
                return this._googleMapsLoader.promise()
            },
            _mapReady: function() {
                try {
                    delete window[GOOGLE_MAP_READY]
                }
                catch(e) {
                    window[GOOGLE_MAP_READY] = undefined
                }
                initCustomMarkerClass();
                this._googleMapsLoader.resolve()
            },
            _init: function() {
                var deferred = $.Deferred(),
                    initPromise = $.Deferred(),
                    controls = this._option("controls");
                this._map = new google.maps.Map(this._$container[0], {
                    zoom: this._option("zoom"),
                    panControl: controls,
                    zoomControl: controls,
                    mapTypeControl: controls,
                    streetViewControl: controls
                });
                var listner = google.maps.event.addListener(this._map, 'idle', $.proxy(initPromise.resolve, initPromise));
                $.when(initPromise).done($.proxy(function() {
                    google.maps.event.removeListener(listner);
                    deferred.resolve()
                }, this));
                return deferred.promise()
            },
            _attachHandlers: function() {
                this._boundsChangeListener = google.maps.event.addListener(this._map, 'bounds_changed', $.proxy(this._boundsChangeHandler, this));
                this._clickListener = google.maps.event.addListener(this._map, 'click', $.proxy(this._clickActionHandler, this))
            },
            _boundsChangeHandler: function() {
                var bounds = this._map.getBounds();
                this._option("bounds", this._normalizeLocationRect(bounds));
                var center = this._map.getCenter();
                this._option("center", this._normalizeLocation(center));
                if (!this._preventZoomChangeEvent)
                    this._option("zoom", this._map.getZoom())
            },
            _clickActionHandler: function(e) {
                this._fireClickAction({location: this._normalizeLocation(e.latLng)})
            },
            updateDimensions: function() {
                var center = this._option("center");
                google.maps.event.trigger(this._map, 'resize');
                this._option("center", center);
                return this.updateCenter()
            },
            updateMapType: function() {
                this._map.setMapTypeId(this._mapType(this._option("type")));
                return $.Deferred().resolve().promise()
            },
            updateBounds: function() {
                var deferred = $.Deferred(),
                    that = this;
                var northEastPromise = this._resolveLocation(this._option("bounds.northEast")),
                    southWestPromise = this._resolveLocation(this._option("bounds.southWest"));
                $.when(northEastPromise, southWestPromise).done(function(northEast, southWest) {
                    var bounds = new google.maps.LatLngBounds;
                    bounds.extend(northEast);
                    bounds.extend(southWest);
                    that._map.fitBounds(bounds);
                    deferred.resolve()
                });
                return deferred.promise()
            },
            updateCenter: function() {
                var deferred = $.Deferred(),
                    that = this;
                this._resolveLocation(this._option("center")).done(function(center) {
                    that._map.setCenter(center);
                    that._option("center", that._normalizeLocation(center));
                    deferred.resolve()
                });
                return deferred.promise()
            },
            updateZoom: function() {
                this._map.setZoom(this._option("zoom"));
                return $.Deferred().resolve().promise()
            },
            updateControls: function() {
                var controls = this._option("controls");
                this._map.setOptions({
                    panControl: controls,
                    zoomControl: controls,
                    mapTypeControl: controls,
                    streetViewControl: controls
                });
                return $.Deferred().resolve().promise()
            },
            _renderMarker: function(options) {
                var d = $.Deferred(),
                    that = this;
                this._resolveLocation(options.location).done(function(location) {
                    var marker;
                    if (options.html)
                        marker = new CustomMarker({
                            map: that._map,
                            position: location,
                            html: options.html,
                            offset: $.extend({
                                top: 0,
                                left: 0
                            }, options.htmlOffset)
                        });
                    else
                        marker = new google.maps.Marker({
                            position: location,
                            map: that._map,
                            icon: options.iconSrc || that._option("markerIconSrc")
                        });
                    var infoWindow = that._renderTooltip(marker, options.tooltip);
                    if (options.clickAction) {
                        DX.log("W0001", "dxMap", "marker.clickAction", "14.2", "Use 'onClick' option instead");
                        options.onClick = options.clickAction
                    }
                    var listner;
                    if (options.onClick || options.tooltip) {
                        var markerClickAction = that._createAction(options.onClick || $.noop),
                            markerNormalizedLocation = that._normalizeLocation(location);
                        listner = google.maps.event.addListener(marker, "click", function() {
                            markerClickAction({location: markerNormalizedLocation});
                            if (infoWindow)
                                infoWindow.open(that._map, marker)
                        })
                    }
                    d.resolve({
                        location: location,
                        marker: marker,
                        listner: listner
                    })
                });
                return d.promise()
            },
            _renderTooltip: function(marker, options) {
                if (!options)
                    return;
                options = this._parseTooltipOptions(options);
                var infoWindow = new google.maps.InfoWindow({content: options.text});
                if (options.visible)
                    infoWindow.open(this._map, marker);
                return infoWindow
            },
            _destroyMarker: function(marker) {
                marker.marker.setMap(null);
                if (marker.listner)
                    google.maps.event.removeListener(marker.listner)
            },
            _renderRoute: function(options) {
                var d = $.Deferred(),
                    that = this,
                    directionsService = new google.maps.DirectionsService;
                var points = $.map(options.locations, function(point) {
                        return that._resolveLocation(point)
                    });
                $.when.apply($, points).done(function() {
                    var locations = $.makeArray(arguments),
                        origin = locations.shift(),
                        destination = locations.pop(),
                        waypoints = $.map(locations, function(location) {
                            return {
                                    location: location,
                                    stopover: true
                                }
                        });
                    var request = {
                            origin: origin,
                            destination: destination,
                            waypoints: waypoints,
                            optimizeWaypoints: true,
                            travelMode: that._movementMode(options.mode)
                        };
                    directionsService.route(request, function(response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            var color = new DX.Color(options.color || that._defaultRouteColor()).toHex(),
                                directionOptions = {
                                    directions: response,
                                    map: that._map,
                                    suppressMarkers: true,
                                    preserveViewport: true,
                                    polylineOptions: {
                                        strokeWeight: options.weight || that._defaultRouteWeight(),
                                        strokeOpacity: options.opacity || that._defaultRouteOpacity(),
                                        strokeColor: color
                                    }
                                };
                            var route = new google.maps.DirectionsRenderer(directionOptions),
                                bounds = response.routes[0].bounds;
                            d.resolve({
                                instance: route,
                                northEast: bounds.getNorthEast(),
                                southWest: bounds.getSouthWest()
                            })
                        }
                    })
                });
                return d.promise()
            },
            _destroyRoute: function(routeObject) {
                routeObject.instance.setMap(null)
            },
            _fitBounds: function() {
                this._updateBounds();
                if (this._bounds && this._option("autoAdjust")) {
                    var zoomBeforeFitting = this._map.getZoom();
                    this._preventZoomChangeEvent = true;
                    this._map.fitBounds(this._bounds);
                    var zoomAfterFitting = this._map.getZoom();
                    if (zoomBeforeFitting < zoomAfterFitting)
                        this._map.setZoom(zoomBeforeFitting);
                    else
                        this._option("zoom", zoomAfterFitting);
                    delete this._preventZoomChangeEvent
                }
                return $.Deferred().resolve().promise()
            },
            _extendBounds: function(location) {
                if (this._bounds)
                    this._bounds.extend(location);
                else {
                    this._bounds = new google.maps.LatLngBounds;
                    this._bounds.extend(location)
                }
            },
            clean: function() {
                if (this._map) {
                    google.maps.event.removeListener(this._boundsChangeListener);
                    google.maps.event.removeListener(this._clickListener);
                    this._clearMarkers();
                    this._clearRoutes();
                    delete this._map;
                    this._$container.empty()
                }
                return $.Deferred().resolve().promise()
            }
        }));
        ui.dxMap.__internals = $.extend(ui.dxMap.__internals, {remapGoogleConstant: function(newValue) {
                GOOGLE_URL = newValue
            }})
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.swipeable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            DX_SWIPEABLE = "dxSwipeable",
            SWIPEABLE_CLASS = "dx-swipeable",
            ACTION_TO_EVENT_MAP = {
                onStart: "dxswipestart",
                onUpdated: "dxswipe",
                onEnd: "dxswipeend",
                onCancel: "dxswipecancel"
            };
        DX.registerComponent(DX_SWIPEABLE, ui, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    elastic: true,
                    immediate: false,
                    direction: "horizontal",
                    itemSizeFunc: null,
                    onStart: null,
                    onUpdated: null,
                    onEnd: null,
                    onCancel: null
                })
            },
            _render: function() {
                this.callBase();
                this.element().addClass(SWIPEABLE_CLASS);
                this._attachEventHandlers()
            },
            _attachEventHandlers: function() {
                this._detachEventHanlers();
                if (this.option("disabled"))
                    return;
                var NAME = this.NAME;
                this._createEventData();
                $.each(ACTION_TO_EVENT_MAP, $.proxy(function(actionName, eventName) {
                    var action = this._createActionByOption(actionName, {context: this});
                    eventName = events.addNamespace(eventName, NAME);
                    this.element().on(eventName, this._eventData, function(e) {
                        return action({jQueryEvent: e})
                    })
                }, this))
            },
            _createEventData: function() {
                this._eventData = {
                    elastic: this.option("elastic"),
                    itemSizeFunc: this.option("itemSizeFunc"),
                    direction: this.option("direction"),
                    immediate: this.option("immediate")
                }
            },
            _detachEventHanlers: function() {
                this.element().off("." + DX_SWIPEABLE)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"disabled":
                    case"onStart":
                    case"onUpdated":
                    case"onEnd":
                    case"onCancel":
                    case"elastic":
                    case"immediate":
                    case"itemSizeFunc":
                    case"direction":
                        this._detachEventHanlers();
                        this._attachEventHandlers();
                        break;
                    case"rtlEnabled":
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.draggable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            translator = DX.translator,
            inflector = DX.inflector,
            events = ui.events,
            DRAGGABLE = "dxDraggable",
            DRAGSTART_EVENT_NAME = events.addNamespace("dxdragstart", DRAGGABLE),
            DRAG_EVENT_NAME = events.addNamespace("dxdrag", DRAGGABLE),
            DRAGEND_EVENT_NAME = events.addNamespace("dxdragend", DRAGGABLE),
            POINTERDOWN_EVENT_NAME = events.addNamespace("dxpointerdown", DRAGGABLE),
            DRAGGABLE_CLASS = inflector.dasherize(DRAGGABLE),
            DRAGGABLE_DRAGGING_CLASS = DRAGGABLE_CLASS + "-dragging";
        DX.registerComponent(DRAGGABLE, ui, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    onDragStart: $.noop,
                    onDrag: $.noop,
                    onDragEnd: $.noop,
                    direction: "both",
                    area: window,
                    boundOffset: 0,
                    allowMoveByClick: false
                })
            },
            _init: function() {
                this.callBase();
                this._attachEventHandlers()
            },
            _attachEventHandlers: function() {
                var $element = this.element().css("position", "absolute"),
                    eventHandlers = {},
                    allowMoveByClick = this.option("allowMoveByClick");
                eventHandlers[DRAGSTART_EVENT_NAME] = $.proxy(this._dragStartHandler, this);
                eventHandlers[DRAG_EVENT_NAME] = $.proxy(this._dragHandler, this);
                eventHandlers[DRAGEND_EVENT_NAME] = $.proxy(this._dragEndHandler, this);
                if (allowMoveByClick) {
                    eventHandlers[POINTERDOWN_EVENT_NAME] = $.proxy(this._pointerDownHandler, this);
                    $element = this._getArea()
                }
                $element.on(eventHandlers, {
                    direction: this.option("direction"),
                    immediate: true
                })
            },
            _detachEventHandlers: function() {
                this.element().off("." + DRAGGABLE);
                this._getArea().off("." + DRAGGABLE)
            },
            _move: function(position) {
                translator.move(this.element(), position)
            },
            _pointerDownHandler: function(e) {
                var $area = $(e.currentTarget),
                    areaOffset = $.isWindow($area.get(0)) ? {
                        left: 0,
                        top: 0
                    } : $area.offset(),
                    direction = this.option("direction"),
                    position = {};
                if (direction === "horizontal" || direction === "both")
                    position.left = e.pageX - this.element().width() / 2 - areaOffset.left;
                if (direction === "vertical" || direction === "both")
                    position.top = e.pageY - this.element().height() / 2 - areaOffset.top;
                this._move(position);
                this._getAction("onDrag")({jQueryEvent: e})
            },
            _dragStartHandler: function(e) {
                var $element = this.element(),
                    $area = this._getArea(),
                    boundOffset = this._getBoundOffset(),
                    areaWidth = $area.outerWidth(),
                    areaHeight = $area.outerHeight(),
                    elementWidth = $element.width(),
                    elementHeight = $element.height();
                this._toggleDraggingClass(true);
                this._startPosition = translator.locate($element);
                e.maxLeftOffset = this._startPosition.left - boundOffset.h;
                e.maxRightOffset = areaWidth - this._startPosition.left - elementWidth - boundOffset.h;
                e.maxTopOffset = this._startPosition.top - boundOffset.v;
                e.maxBottomOffset = areaHeight - this._startPosition.top - elementHeight - boundOffset.v;
                this._getAction("onDragStart")({jQueryEvent: e})
            },
            _toggleDraggingClass: function(value) {
                this.element().toggleClass(DRAGGABLE_DRAGGING_CLASS, value)
            },
            _getBoundOffset: function() {
                var boundOffset = this.option("boundOffset");
                if ($.isFunction(boundOffset))
                    boundOffset = boundOffset.call(this);
                return DX.utils.stringPairToObject(boundOffset)
            },
            _getArea: function() {
                var area = this.option("area");
                if ($.isFunction(area))
                    area = area.call(this);
                return $(area)
            },
            _dragHandler: function(e) {
                var offset = e.offset,
                    startPosition = this._startPosition;
                this._move({
                    left: startPosition.left + offset.x,
                    top: startPosition.top + offset.y
                });
                this._getAction("onDrag")({jQueryEvent: e})
            },
            _dragEndHandler: function(e) {
                this._toggleDraggingClass(false);
                this._getAction("onDragEnd")({jQueryEvent: e})
            },
            _getAction: function(name) {
                return this["_" + name + "Action"] || this._createActionByOption(name)
            },
            _render: function() {
                this.callBase();
                this.element().addClass(DRAGGABLE_CLASS)
            },
            _optionChanged: function(args) {
                var name = args.name;
                switch (name) {
                    case"onDragStart":
                    case"onDrag":
                    case"onDragEnd":
                        this["_" + name + "Action"] = this._createActionByOption(name);
                        break;
                    case"allowMoveByClick":
                    case"direction":
                        this._detachEventHandlers();
                        this._attachEventHandlers();
                        break;
                    case"boundOffset":
                    case"area":
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _dispose: function() {
                this.callBase();
                this._detachEventHandlers()
            }
        }));
        ui.dxDraggable.__internals = {DRAGGABLE_CLASS: DRAGGABLE_CLASS}
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.resizable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            RESIZABLE = "dxResizable",
            RESIZABLE_CLASS = "dx-resizable",
            RESIZABLE_RESIZING_CLASS = "dx-resizable-resizing",
            RESIZABLE_HANDLE_CLASS = "dx-resizable-handle",
            RESIZABLE_HANDLE_TOP_CLASS = "dx-resizable-handle-top",
            RESIZABLE_HANDLE_BOTTOM_CLASS = "dx-resizable-handle-bottom",
            RESIZABLE_HANDLE_LEFT_CLASS = "dx-resizable-handle-left",
            RESIZABLE_HANDLE_RIGHT_CLASS = "dx-resizable-handle-right",
            RESIZABLE_HANDLE_CORNER_CLASS = "dx-resizable-handle-corner",
            DRAGSTART_START_EVENT_NAME = events.addNamespace("dxdragstart", RESIZABLE),
            DRAGSTART_EVENT_NAME = events.addNamespace("dxdrag", RESIZABLE),
            DRAGSTART_END_EVENT_NAME = events.addNamespace("dxdragend", RESIZABLE);
        DX.registerComponent(RESIZABLE, ui, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    handles: "all",
                    step: "1",
                    area: undefined,
                    minWidth: 30,
                    maxWidth: Infinity,
                    minHeight: 30,
                    maxHeight: Infinity,
                    onResizeStart: null,
                    onResize: null,
                    onResizeEnd: null
                })
            },
            _init: function() {
                this.callBase();
                this.element().addClass(RESIZABLE_CLASS)
            },
            _render: function() {
                this.callBase();
                this._renderActions();
                this._renderHandles()
            },
            _renderActions: function() {
                this._resizeStartAction = this._createActionByOption("onResizeStart");
                this._resizeEndAction = this._createActionByOption("onResizeEnd");
                this._resizeAction = this._createActionByOption("onResize")
            },
            _renderHandles: function() {
                var handles = this.option("handles");
                if (handles === "none")
                    return;
                var directions = handles === "all" ? ['top', 'bottom', 'left', 'right'] : handles.split(" ");
                $.each(directions, $.proxy(function(index, handleName) {
                    this._renderHandle(handleName)
                }, this));
                $.inArray('bottom', directions) + 1 && $.inArray('right', directions) + 1 && this._renderHandle("corner-bottom-right");
                $.inArray('bottom', directions) + 1 && $.inArray('left', directions) + 1 && this._renderHandle("corner-bottom-left");
                $.inArray('top', directions) + 1 && $.inArray('right', directions) + 1 && this._renderHandle("corner-top-right");
                $.inArray('top', directions) + 1 && $.inArray('left', directions) + 1 && this._renderHandle("corner-top-left")
            },
            _renderHandle: function(handleName) {
                var $element = this.element(),
                    $handle = $("<div>");
                $handle.addClass(RESIZABLE_HANDLE_CLASS).addClass(RESIZABLE_HANDLE_CLASS + "-" + handleName).appendTo($element);
                var handlers = {};
                handlers[DRAGSTART_START_EVENT_NAME] = $.proxy(this._dragStartHandler, this);
                handlers[DRAGSTART_EVENT_NAME] = $.proxy(this._dragHandler, this);
                handlers[DRAGSTART_END_EVENT_NAME] = $.proxy(this._dragEndHandler, this);
                $handle.on(handlers, {
                    direction: this._dragEventDirection(handleName),
                    immediate: true
                })
            },
            _dragEventDirection: function(handleName) {
                switch (handleName) {
                    case"right":
                    case"left":
                        return "horizontal";
                    case"top":
                    case"bottom":
                        return "vertical";
                    default:
                        return "both"
                }
            },
            _dragStartHandler: function(e) {
                this._toggleResizingClass(true);
                this._movingSides = this._getMovingSides(e);
                var $element = this.element();
                this._elementLocation = DX.translator.locate($element);
                this._elementSize = {
                    width: $element.outerWidth(),
                    height: $element.outerHeight()
                };
                this._renderDragOffsets(e);
                this._resizeStartAction({
                    jQueryEvent: e,
                    width: this._elementSize.width,
                    height: this._elementSize.height,
                    handles: this._movingSides
                });
                e.targetElements = null
            },
            _toggleResizingClass: function(value) {
                this.element().toggleClass(RESIZABLE_RESIZING_CLASS, value)
            },
            _renderDragOffsets: function(e) {
                var $area = this._getArea(),
                    $handle = $(e.target).closest("." + RESIZABLE_HANDLE_CLASS);
                if (!$area.length)
                    return;
                var areaWidth = $area.innerWidth(),
                    areaHeight = $area.innerHeight(),
                    handleWidth = $handle.outerWidth(),
                    handleHeight = $handle.outerHeight();
                var handleOffset = $handle.offset(),
                    areaOffset = $area.offset() || {
                        top: 0,
                        left: 0
                    };
                areaOffset.left += this._getBorderWidth($area, "left") + this._getBorderWidth(this.element(), "left");
                areaOffset.top += this._getBorderWidth($area, "top") + this._getBorderWidth(this.element(), "top");
                areaWidth -= this.element().outerWidth() - this.element().innerWidth();
                areaHeight -= this.element().outerHeight() - this.element().innerHeight();
                e.maxLeftOffset = handleOffset.left - areaOffset.left;
                e.maxRightOffset = areaOffset.left + areaWidth - handleOffset.left - handleWidth;
                e.maxTopOffset = handleOffset.top - areaOffset.top;
                e.maxBottomOffset = areaOffset.top + areaHeight - handleOffset.top - handleHeight
            },
            _getBorderWidth: function($element, direction) {
                var borderWidth = $element.css("border-" + direction + "-width");
                return parseInt(borderWidth) || 0
            },
            _dragHandler: function(e) {
                var $element = this.element(),
                    offset = this._getOffset(e),
                    sides = this._movingSides;
                var location = this._elementLocation,
                    size = this._elementSize;
                var width = size.width + offset.x * (sides.left ? -1 : 1),
                    height = size.height + offset.y * (sides.top ? -1 : 1);
                this._renderSize(width, height);
                var offsetTop = offset.y - (this.option("height") - height),
                    offsetLeft = offset.x - (this.option("width") - width);
                DX.translator.move($element, {
                    top: location.top + (sides.top ? offsetTop : 0),
                    left: location.left + (sides.left ? offsetLeft : 0)
                });
                this._resizeAction({
                    jQueryEvent: e,
                    width: width,
                    height: height,
                    handles: this._movingSides
                })
            },
            _getOffset: function(e) {
                var offset = e.offset,
                    steps = DX.utils.stringPairToObject(this.option("step"));
                return {
                        x: offset.x - offset.x % steps.h,
                        y: offset.y - offset.y % steps.v
                    }
            },
            _getMovingSides: function(e) {
                var $target = $(e.target);
                return {
                        top: $target.hasClass(RESIZABLE_HANDLE_TOP_CLASS) || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-top-left") || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-top-right"),
                        left: $target.hasClass(RESIZABLE_HANDLE_LEFT_CLASS) || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-top-left") || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-bottom-left"),
                        bottom: $target.hasClass(RESIZABLE_HANDLE_BOTTOM_CLASS) || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-bottom-left") || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-bottom-right"),
                        right: $target.hasClass(RESIZABLE_HANDLE_RIGHT_CLASS) || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-top-right") || $target.hasClass(RESIZABLE_HANDLE_CORNER_CLASS + "-bottom-right")
                    }
            },
            _getArea: function() {
                var area = this.option("area");
                if ($.isFunction(area))
                    area = area.call(this);
                return $(area)
            },
            _dragEndHandler: function(e) {
                var $element = this.element();
                this._resizeEndAction({
                    jQueryEvent: e,
                    width: $element.outerWidth(),
                    height: $element.outerHeight(),
                    handles: this._movingSides
                });
                this._toggleResizingClass(false)
            },
            _renderSize: function(width, height) {
                this.option("width", utils.fitIntoRange(width, this.option("minWidth"), this.option("maxWidth")));
                this.option("height", utils.fitIntoRange(height, this.option("minHeight"), this.option("maxHeight")))
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"handles":
                        this._invalidate();
                        break;
                    case"minWidth":
                    case"maxWidth":
                    case"minHeight":
                    case"maxHeight":
                        this._renderSize(this.element().outerWidth(), this.element().outerHeight());
                        break;
                    case"onResize":
                    case"onResizeStart":
                    case"onResizeEnd":
                        this._renderActions();
                        break;
                    case"gridStepHorizontal":
                    case"gridStepVertical":
                    case"area":
                    case"step":
                        break;
                    default:
                        this.callBase(args);
                        break
                }
            },
            _clean: function() {
                this.element().find("." + RESIZABLE_HANDLE_CLASS).remove()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.box.js */
    (function($, DX, undefined) {
        var ui = DevExpress.ui,
            utils = DX.utils;
        var BOX_CLASS = "dx-box",
            BOX_SELECTOR = ".dx-box",
            BOX_ITEM_CLASS = "dx-box-item",
            BOX_ITEM_DATA_KEY = "dxBoxItemData";
        var flexGrowProp = DX.support.styleProp("flexGrow");
        var flexShrinkProp = DX.support.styleProp("flexShrink");
        var flexPropPrefix = DX.support.stylePropPrefix("flexDirection");
        var MINSIZE_MAP = {
                row: "minWidth",
                col: "minHeight"
            };
        var MAXSIZE_MAP = {
                row: "maxWidth",
                col: "maxHeight"
            };
        var SHRINK = 1;
        var FLEX_JUSTIFY_CONTENT_MAP = {
                start: "flex-start",
                end: "flex-end",
                center: "center",
                "space-between": "space-between",
                "space-around": "space-around"
            };
        var FLEX_ALIGN_ITEMS_MAP = {
                start: "flex-start",
                end: "flex-end",
                center: "center",
                stretch: "stretch"
            };
        var FLEX_DIRECTION_MAP = {
                row: "row",
                col: "column"
            };
        var FlexLayoutStrategy = DX.Class.inherit({
                ctor: function($element, option) {
                    this._$element = $element;
                    this._option = option
                },
                renderBox: function() {
                    this._$element.css({
                        display: DX.support.stylePropPrefix("flexDirection") + "flex",
                        flexDirection: FLEX_DIRECTION_MAP[this._option("direction")]
                    })
                },
                renderAlign: function() {
                    this._$element.css({justifyContent: this._normalizedAlign()})
                },
                _normalizedAlign: function() {
                    var align = this._option("align");
                    return align in FLEX_JUSTIFY_CONTENT_MAP ? FLEX_JUSTIFY_CONTENT_MAP[align] : align
                },
                renderCrossAlign: function() {
                    this._$element.css({alignItems: this._normalizedCrossAlign()})
                },
                _normalizedCrossAlign: function() {
                    var crossAlign = this._option("crossAlign");
                    return crossAlign in FLEX_ALIGN_ITEMS_MAP ? FLEX_ALIGN_ITEMS_MAP[crossAlign] : crossAlign
                },
                renderItems: function($items) {
                    var direction = this._option("direction");
                    $.each($items, function() {
                        var $item = $(this);
                        var item = $item.data(BOX_ITEM_DATA_KEY);
                        $item.css({
                            display: flexPropPrefix + "flex",
                            flexBasis: item.baseSize || 0
                        }).css(MAXSIZE_MAP[direction], item.maxSize || "none").css(MINSIZE_MAP[direction], item.minSize || "0");
                        var itemStyle = $item.get(0).style;
                        itemStyle[flexGrowProp] = item.ratio;
                        itemStyle[flexShrinkProp] = utils.isDefined(item.shrink) ? item.shrink : SHRINK;
                        $item.children().each(function(_, itemContent) {
                            $(itemContent).css({
                                width: "auto",
                                height: "auto",
                                display: DX.support.stylePropPrefix("flexDirection") + "flex",
                                flexDirection: $item.children().css("flexDirection") || "column"
                            });
                            itemContent.style[flexGrowProp] = 1
                        })
                    })
                },
                update: $.noop
            });
        var BOX_EVENTNAMESPACE = "dxBox",
            UPDATE_EVENT = "dxupdate." + BOX_EVENTNAMESPACE,
            FALLBACK_BOX_ITEM = "dx-box-fallback-item";
        var FALLBACK_WRAP_MAP = {
                row: "nowrap",
                col: "normal"
            };
        var FALLBACK_MAIN_SIZE_MAP = {
                row: "width",
                col: "height"
            };
        var FALLBACK_CROSS_SIZE_MAP = {
                row: "height",
                col: "width"
            };
        var FALLBACK_PRE_MARGIN_MAP = {
                row: "marginLeft",
                col: "marginTop"
            };
        var FALLBACK_POST_MARGIN_MAP = {
                row: "marginRight",
                col: "marginBottom"
            };
        var FALLBACK_CROSS_PRE_MARGIN_MAP = {
                row: "marginTop",
                col: "marginLeft"
            };
        var FALLBACK_CROSS_POST_MARGIN_MAP = {
                row: "marginBottom",
                col: "marginRight"
            };
        var MARGINS_RTL_FLIP_MAP = {
                marginLeft: "marginRight",
                marginRight: "marginLeft"
            };
        var FallbackLayoutStrategy = DX.Class.inherit({
                ctor: function($element, option) {
                    this._$element = $element;
                    this._option = option
                },
                renderBox: function() {
                    this._$element.css({
                        fontSize: 0,
                        whiteSpace: FALLBACK_WRAP_MAP[this._option("direction")],
                        verticalAlign: "top"
                    });
                    this._$element.off(UPDATE_EVENT).on(UPDATE_EVENT, $.proxy(this.update, this))
                },
                renderAlign: function() {
                    var $items = this._$items;
                    if (!$items)
                        return;
                    var align = this._option("align"),
                        shift = 0,
                        totalItemSize = this.totalItemSize,
                        direction = this._option("direction"),
                        boxSize = this._$element[FALLBACK_MAIN_SIZE_MAP[direction]](),
                        freeSpace = boxSize - totalItemSize;
                    this._setItemsMargins($items, direction, 0);
                    switch (align) {
                        case"start":
                            break;
                        case"end":
                            shift = freeSpace;
                            $items.first().css(this._chooseMarginSide(FALLBACK_PRE_MARGIN_MAP[direction]), shift);
                            break;
                        case"center":
                            shift = 0.5 * freeSpace;
                            $items.first().css(this._chooseMarginSide(FALLBACK_PRE_MARGIN_MAP[direction]), shift);
                            $items.last().css(this._chooseMarginSide(FALLBACK_POST_MARGIN_MAP[direction]), shift);
                            break;
                        case"space-between":
                            shift = 0.5 * freeSpace / ($items.length - 1);
                            this._setItemsMargins($items, direction, shift);
                            $items.first().css(this._chooseMarginSide(FALLBACK_PRE_MARGIN_MAP[direction]), 0);
                            $items.last().css(this._chooseMarginSide(FALLBACK_POST_MARGIN_MAP[direction]), 0);
                            break;
                        case"space-around":
                            shift = 0.5 * freeSpace / $items.length;
                            this._setItemsMargins($items, direction, shift);
                            break
                    }
                },
                _setItemsMargins: function($items, direction, shift) {
                    $items.css(this._chooseMarginSide(FALLBACK_PRE_MARGIN_MAP[direction]), shift).css(this._chooseMarginSide(FALLBACK_POST_MARGIN_MAP[direction]), shift)
                },
                renderCrossAlign: function() {
                    var $items = this._$items;
                    if (!$items)
                        return;
                    var crossAlign = this._option("crossAlign"),
                        direction = this._option("direction"),
                        size = this._$element[FALLBACK_CROSS_SIZE_MAP[direction]]();
                    var that = this;
                    switch (crossAlign) {
                        case"start":
                            break;
                        case"end":
                            $.each($items, function() {
                                var $item = $(this),
                                    itemSize = $item[FALLBACK_CROSS_SIZE_MAP[direction]](),
                                    shift = size - itemSize;
                                $item.css(that._chooseMarginSide(FALLBACK_CROSS_PRE_MARGIN_MAP[direction]), shift)
                            });
                            break;
                        case"center":
                            $.each($items, function() {
                                var $item = $(this),
                                    itemSize = $item[FALLBACK_CROSS_SIZE_MAP[direction]](),
                                    shift = 0.5 * (size - itemSize);
                                $item.css(that._chooseMarginSide(FALLBACK_CROSS_PRE_MARGIN_MAP[direction]), shift).css(that._chooseMarginSide(FALLBACK_CROSS_POST_MARGIN_MAP[direction]), shift)
                            });
                            break;
                        case"stretch":
                            $items.css(that._chooseMarginSide(FALLBACK_CROSS_PRE_MARGIN_MAP[direction]), 0).css(that._chooseMarginSide(FALLBACK_CROSS_POST_MARGIN_MAP[direction]), 0).css(FALLBACK_CROSS_SIZE_MAP[direction], "100%");
                            break
                    }
                },
                _chooseMarginSide: function(value) {
                    if (!this._option("rtlEnabled"))
                        return value;
                    return MARGINS_RTL_FLIP_MAP[value] || value
                },
                renderItems: function($items) {
                    this._$items = $items;
                    var direction = this._option("direction"),
                        totalRatio = 0,
                        totalWeightedShrink = 0,
                        totalBaseSize = 0,
                        boxSize = this._$element[FALLBACK_MAIN_SIZE_MAP[direction]](),
                        parseSize = function(size) {
                            return String(size).match(/.+%$/) ? 0.01 * parseFloat(size) * boxSize : size
                        },
                        contentSize = function($item) {
                            return $item[FALLBACK_MAIN_SIZE_MAP[direction]]()
                        },
                        baseSize = function($item) {
                            var item = $item.data(BOX_ITEM_DATA_KEY);
                            return item.baseSize == null ? 0 : item.baseSize === "auto" ? contentSize($item) : parseSize(item.baseSize)
                        };
                    $.each($items, function() {
                        var $item = $(this);
                        $item.css("display", "inline-block").css("vertical-align", "top");
                        $item[FALLBACK_MAIN_SIZE_MAP[direction]]("auto");
                        $item.removeClass(FALLBACK_BOX_ITEM);
                        var item = $item.data(BOX_ITEM_DATA_KEY),
                            ratio = item.ratio || 0,
                            size = baseSize($item),
                            shrink = utils.isDefined(item.shrink) ? item.shrink : SHRINK;
                        totalRatio += ratio;
                        totalWeightedShrink += shrink * size;
                        totalBaseSize += size
                    });
                    boxSize = this._$element[FALLBACK_MAIN_SIZE_MAP[direction]]();
                    var freeSpaceSize = boxSize - totalBaseSize;
                    var itemSize = function($item) {
                            var item = $item.data(BOX_ITEM_DATA_KEY),
                                size = baseSize($item),
                                factor = freeSpaceSize >= 0 ? item.ratio || 0 : (utils.isDefined(item.shrink) ? item.shrink : SHRINK) * size,
                                totalFactor = freeSpaceSize >= 0 ? totalRatio : totalWeightedShrink,
                                shift = totalFactor ? Math.round(freeSpaceSize * factor / totalFactor) : 0;
                            return size + shift
                        };
                    var totalItemSize = 0;
                    $.each($items, function() {
                        var $item = $(this),
                            item = $item.data(BOX_ITEM_DATA_KEY),
                            size = itemSize($item);
                        totalItemSize += size;
                        $item.css(MAXSIZE_MAP[direction], item.maxSize || "none").css(MINSIZE_MAP[direction], item.minSize || "0").css(FALLBACK_MAIN_SIZE_MAP[direction], size);
                        $item.addClass(FALLBACK_BOX_ITEM)
                    });
                    this.totalItemSize = totalItemSize
                },
                update: function() {
                    if (!this._$items || this._$element.is(":hidden"))
                        return;
                    this.renderItems(this._$items);
                    this.renderAlign();
                    this.renderCrossAlign();
                    var element = this._$element.get(0);
                    this._$items.find(BOX_SELECTOR).each(function() {
                        if (element === $(this).parent().closest(BOX_SELECTOR).get(0))
                            $(this).triggerHandler(UPDATE_EVENT)
                    })
                }
            });
        DX.registerComponent("dxBox", ui, ui.CollectionWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    direction: "row",
                    align: "start",
                    crossAlign: "stretch",
                    activeStateEnabled: false,
                    focusStateEnabled: false,
                    _layoutStrategy: "flex"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function() {
                                var device = DX.devices.real();
                                var isOldAndroid = device.platform === "android" && (device.version[0] < 4 || device.version[0] === 4 && device.version[1] < 4),
                                    isOldIos = device.platform === "ios" && device.version[0] < 7;
                                return DX.browser["msie"] || isOldAndroid || isOldIos
                            },
                            options: {_layoutStrategy: "fallback"}
                        }])
            },
            _itemClass: function() {
                return BOX_ITEM_CLASS
            },
            _itemDataKey: function() {
                return BOX_ITEM_DATA_KEY
            },
            _itemElements: function() {
                return this._itemContainer().children(this._itemSelector())
            },
            _init: function() {
                this.callBase();
                this.element().addClass(BOX_CLASS + "-" + this.option("_layoutStrategy"));
                this._initLayout()
            },
            _initLayout: function() {
                this._layout = this.option("_layoutStrategy") === "fallback" ? new FallbackLayoutStrategy(this.element(), $.proxy(this.option, this)) : new FlexLayoutStrategy(this.element(), $.proxy(this.option, this))
            },
            _render: function() {
                this.callBase();
                this.element().addClass(BOX_CLASS);
                this._renderBox()
            },
            _renderBox: function() {
                this._layout.renderBox();
                this._layout.renderAlign();
                this._layout.renderCrossAlign()
            },
            _renderItems: function(items) {
                this.callBase(items);
                this._layout.renderItems(this._itemElements());
                clearTimeout(this._updateTimer);
                this._updateTimer = setTimeout($.proxy(function() {
                    if (!this._isUpdated)
                        this._layout.update();
                    this._isUpdated = false
                }, this))
            },
            _postprocessRenderItem: function(args) {
                var boxConfig = args.itemData.box;
                if (!boxConfig)
                    return;
                this._createComponent(args.itemContent, "dxBox", $.extend({
                    itemTemplate: this.option("itemTemplate"),
                    itemHoldTimeout: this.option("itemHoldTimeout"),
                    onItemHold: this.option("onItemHold"),
                    onItemClick: this.option("onItemClick"),
                    onItemContextMenu: this.option("onItemContextMenu"),
                    onItemRendered: this.option("onItemRendered")
                }, boxConfig))
            },
            _createItemByTemplate: function(itemTemplate, args) {
                return args.item.box ? itemTemplate.source() : this.callBase(itemTemplate, args)
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._isUpdated = true;
                this._layout.update()
            },
            _dispose: function() {
                clearTimeout(this._updateTimer);
                this.callBase.apply(this, arguments)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"_layoutStrategy":
                    case"direction":
                        this._invalidate();
                        break;
                    case"align":
                        this._layout.renderAlign();
                        break;
                    case"crossAlign":
                        this._layout.renderCrossAlign();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            repaint: function() {
                this._dimensionChanged()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.responsiveBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var RESPONSIVE_BOX_CLASS = "dx-responsivebox",
            BOX_ITEM_CLASS = "dx-box-item",
            BOX_ITEM_DATA_KEY = "dxBoxItemData";
        var DEFAULT_SCREEN_FACTOR_FUNC = function(width) {
                if (width < 768)
                    return "xs";
                else if (width < 992)
                    return "sm";
                else if (width < 1200)
                    return "md";
                else
                    return "lg"
            };
        DX.registerComponent("dxResponsiveBox", ui, ui.CollectionWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    rows: [],
                    cols: [],
                    screenByWidth: DEFAULT_SCREEN_FACTOR_FUNC,
                    singleColumnScreen: "xs",
                    activeStateEnabled: false,
                    focusStateEnabled: false
                })
            },
            _initOptions: function(options) {
                if (options.screenByWidth)
                    this.option("singleColumnScreen", options.screenByWidth(0));
                this.callBase(options)
            },
            _itemClass: function() {
                return BOX_ITEM_CLASS
            },
            _itemDataKey: function() {
                return BOX_ITEM_DATA_KEY
            },
            _render: function() {
                this.callBase();
                this.element().addClass(RESPONSIVE_BOX_CLASS);
                this._updateRootBox()
            },
            _updateRootBox: function() {
                clearTimeout(this._updateTimer);
                this._updateTimer = setTimeout($.proxy(function() {
                    if (this._$root)
                        this._$root.trigger("dxupdate")
                }, this))
            },
            _renderItems: function() {
                this._screenItems = this._itemsByScreen();
                this._prepareGrid();
                this._spreadItems();
                this._layoutItems();
                this._linkNodeToItem()
            },
            _prepareGrid: function() {
                var grid = this._grid = [];
                this._prepareRowsAndCols();
                $.each(this._rows, $.proxy(function() {
                    var row = [];
                    grid.push(row);
                    $.each(this._cols, $.proxy(function() {
                        row.push(this._createEmptyCell())
                    }, this))
                }, this))
            },
            _prepareRowsAndCols: function() {
                if (this._isSingleColumnScreen()) {
                    this._prepareSingleColumnScreenItems();
                    this._rows = this._defaultSizeConfig(this._screenItems.length);
                    this._cols = this._defaultSizeConfig(1)
                }
                else {
                    this._rows = this._sizesByScreen(this.option("rows"));
                    this._cols = this._sizesByScreen(this.option("cols"))
                }
            },
            _isSingleColumnScreen: function() {
                return this._screenRegExp().test(this.option("singleColumnScreen")) || !this.option("rows").length || !this.option("cols").length
            },
            _prepareSingleColumnScreenItems: function() {
                this._screenItems.sort(function(item1, item2) {
                    return item1.location.row - item2.location.row || item1.location.col - item2.location.col
                });
                $.each(this._screenItems, function(index, item) {
                    $.extend(item.location, {
                        row: index,
                        col: 0,
                        rowspan: 1,
                        colspan: 1
                    })
                })
            },
            _sizesByScreen: function(sizeConfigs) {
                return $.map(this._filterByScreen(sizeConfigs), $.proxy(function(sizeConfig) {
                        return $.extend(this._defaultSizeConfig(), sizeConfig)
                    }, this))
            },
            _defaultSizeConfig: function(size) {
                var defaultSizeConfig = {
                        ratio: 1,
                        baseSize: 0,
                        minSize: 0,
                        maxSize: 0
                    };
                if (!arguments.length)
                    return defaultSizeConfig;
                var result = [];
                for (var i = 0; i < size; i++)
                    result.push(defaultSizeConfig);
                return result
            },
            _filterByScreen: function(items) {
                var screenRegExp = this._screenRegExp();
                return $.grep(items, function(item) {
                        return !item.screen || screenRegExp.test(item.screen)
                    })
            },
            _screenRegExp: function() {
                var width = this._screenWidth();
                var screen = this.option("screenByWidth")(width);
                return new RegExp("(^|\\s)" + screen + "($|\\s)", "i")
            },
            _screenWidth: function() {
                return $(window).width()
            },
            _createEmptyCell: function() {
                return {
                        item: {},
                        location: {
                            colspan: 1,
                            rowspan: 1
                        }
                    }
            },
            _spreadItems: function() {
                var cols = this.option("cols");
                $.each(this._screenItems, $.proxy(function(_, itemInfo) {
                    var location = itemInfo.location || {};
                    var itemCol = location.col;
                    var itemRow = location.row;
                    var row = this._grid[itemRow];
                    var itemCell = row && row[itemCol];
                    this._occupyCells(itemCell, itemInfo)
                }, this))
            },
            _itemsByScreen: function() {
                return $.map(this.option("items"), $.proxy(function(item) {
                        var locations = item.location || {};
                        locations = $.isPlainObject(locations) ? [locations] : locations;
                        return $.map(this._filterByScreen(locations), function(location) {
                                return {
                                        item: item,
                                        location: $.extend({
                                            rowspan: 1,
                                            colspan: 1
                                        }, location)
                                    }
                            })
                    }, this))
            },
            _occupyCells: function(itemCell, itemInfo) {
                if (!itemCell || this._isItemCellOccupied(itemCell, itemInfo))
                    return;
                $.extend(itemCell, itemInfo);
                this._markSpanningCell(itemCell)
            },
            _isItemCellOccupied: function(itemCell, itemInfo) {
                if (!$.isEmptyObject(itemCell.item))
                    return true;
                var result = false;
                this._loopOverSpanning(itemInfo.location, function(cell) {
                    result = result || !$.isEmptyObject(cell.item)
                });
                return result
            },
            _loopOverSpanning: function(location, callback) {
                var rowEnd = location.row + location.rowspan - 1;
                var colEnd = location.col + location.colspan - 1;
                var boundRowEnd = Math.min(rowEnd, this._rows.length - 1);
                var boundColEnd = Math.min(colEnd, this._cols.length - 1);
                location.rowspan -= rowEnd - boundRowEnd;
                location.colspan -= colEnd - boundColEnd;
                for (var rowIndex = location.row; rowIndex <= boundRowEnd; rowIndex++)
                    for (var colIndex = location.col; colIndex <= boundColEnd; colIndex++)
                        if (rowIndex !== location.row || colIndex !== location.col)
                            callback(this._grid[rowIndex][colIndex])
            },
            _markSpanningCell: function(itemCell) {
                this._loopOverSpanning(itemCell.location, function(cell) {
                    $.extend(cell, {
                        item: itemCell.item,
                        spanningCell: itemCell
                    })
                })
            },
            _linkNodeToItem: function() {
                $.each(this._itemElements(), function(_, itemNode) {
                    var $item = $(itemNode),
                        item = $item.data(BOX_ITEM_DATA_KEY);
                    if (!item.box)
                        item.node = $item.children()
                })
            },
            _layoutItems: function() {
                var rowsCount = this._grid.length;
                var colsCount = rowsCount && this._grid[0].length;
                if (!rowsCount && !colsCount)
                    return;
                var result = this._layoutBlock({
                        direction: "col",
                        row: {
                            start: 0,
                            end: rowsCount - 1
                        },
                        col: {
                            start: 0,
                            end: colsCount - 1
                        }
                    });
                var rootBox = this._prepareBoxConfig(result.box || {
                        direction: "col",
                        items: [result]
                    });
                $.extend(rootBox, this._rootBoxConfig());
                this._$root = $("<div>").appendTo(this._itemContainer());
                this._createComponent(this._$root, "dxBox", rootBox)
            },
            _rootBoxConfig: function(config) {
                return {
                        width: "100%",
                        height: "100%",
                        itemTemplate: this.option("itemTemplate"),
                        itemHoldTimeout: this.option("itemHoldTimeout"),
                        onItemHold: this.option("onItemHold"),
                        onItemClick: this.option("onItemClick"),
                        onItemContextMenu: this.option("onItemContextMenu"),
                        onItemRendered: this.option("onItemRendered")
                    }
            },
            _prepareBoxConfig: function(config) {
                return $.extend(config || {}, {crossAlign: "stretch"})
            },
            _layoutBlock: function(options) {
                if (this._isSingleItem(options))
                    return this._itemByCell(options.row.start, options.col.start);
                return this._layoutDirection(options)
            },
            _isSingleItem: function(options) {
                var firstCellLocation = this._grid[options.row.start][options.col.start].location;
                var isItemRowSpanned = options.row.end - options.row.start === firstCellLocation.rowspan - 1;
                var isItemColSpanned = options.col.end - options.col.start === firstCellLocation.colspan - 1;
                return isItemRowSpanned && isItemColSpanned
            },
            _itemByCell: function(rowIndex, colIndex) {
                var itemCell = this._grid[rowIndex][colIndex];
                return itemCell.spanningCell ? null : itemCell.item
            },
            _layoutDirection: function(options) {
                var items = [];
                var direction = options.direction;
                var crossDirection = this._crossDirection(direction);
                var block;
                while (block = this._nextBlock(options)) {
                    if (this._isBlockIndivisible(options.prevBlockOptions, block))
                        throw DX.Error("E1025");
                    var item = this._layoutBlock({
                            direction: crossDirection,
                            row: block.row,
                            col: block.col,
                            prevBlockOptions: options
                        });
                    if (item) {
                        $.extend(item, this._blockSize(block, crossDirection));
                        items.push(item)
                    }
                    options[crossDirection].start = block[crossDirection].end + 1
                }
                return {box: this._prepareBoxConfig({
                            direction: direction,
                            items: items
                        })}
            },
            _isBlockIndivisible: function(options, block) {
                return options && options.col.start === block.col.start && options.col.end === block.col.end && options.row.start === block.row.start && options.row.end === block.row.end
            },
            _crossDirection: function(direction) {
                return direction === "col" ? "row" : "col"
            },
            _nextBlock: function(options) {
                var direction = options.direction;
                var crossDirection = this._crossDirection(direction);
                var startIndex = options[direction].start;
                var endIndex = options[direction].end;
                var crossStartIndex = options[crossDirection].start;
                if (crossStartIndex > options[crossDirection].end)
                    return null;
                var crossSpan = 1;
                for (var crossIndex = crossStartIndex; crossIndex < crossStartIndex + crossSpan; crossIndex++) {
                    var lineCrossSpan = 1;
                    for (var index = startIndex; index <= endIndex; index++) {
                        var cell = this._cellByDirection(direction, index, crossIndex);
                        lineCrossSpan = Math.max(lineCrossSpan, cell.location[crossDirection + "span"])
                    }
                    var lineCrossEndIndex = crossIndex + lineCrossSpan;
                    var crossEndIndex = crossStartIndex + crossSpan;
                    if (lineCrossEndIndex > crossEndIndex)
                        crossSpan += lineCrossEndIndex - crossEndIndex
                }
                var result = {};
                result[direction] = {
                    start: startIndex,
                    end: endIndex
                };
                result[crossDirection] = {
                    start: crossStartIndex,
                    end: crossStartIndex + crossSpan - 1
                };
                return result
            },
            _cellByDirection: function(direction, index, crossIndex) {
                return direction === "col" ? this._grid[crossIndex][index] : this._grid[index][crossIndex]
            },
            _blockSize: function(block, direction) {
                var sizeConfigs = direction === "row" ? this._rows : this._cols;
                var result = {
                        ratio: 0,
                        baseSize: 0,
                        minSize: 0,
                        maxSize: 0
                    };
                for (var index = block[direction].start; index <= block[direction].end; index++) {
                    var sizeConfig = sizeConfigs[index];
                    result.ratio += sizeConfig.ratio;
                    result.baseSize += sizeConfig.baseSize;
                    result.minSize += sizeConfig.minSize;
                    result.maxSize += sizeConfig.maxSize
                }
                result.minSize = result.minSize ? result.minSize : "auto";
                result.maxSize = result.maxSize ? result.maxSize : "auto";
                this._isSingleColumnScreen() && (result.baseSize = 'auto');
                return result
            },
            _update: function() {
                var $existingRoot = this._$root;
                this._renderItems();
                $existingRoot.remove()
            },
            _dispose: function() {
                clearTimeout(this._updateTimer);
                this.callBase.apply(this, arguments)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"rows":
                    case"cols":
                    case"screenByWidth":
                    case"singleColumnScreen":
                        this._invalidate();
                        break;
                    case"width":
                    case"height":
                        this.callBase(args);
                        this._update();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _dimensionChanged: function() {
                this._update()
            },
            repaint: function() {
                this._update()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.button.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var BUTTON_CLASS = "dx-button",
            BUTTON_CONTENT_CLASS = "dx-button-content",
            BUTTON_CONTENT_SELECTOR = ".dx-button-content",
            BUTTON_TEXT_CLASS = "dx-button-text",
            BUTTON_HAS_TEXT_CLASS = "dx-button-has-text",
            BUTTON_HAS_ICON_CLASS = "dx-button-has-icon",
            BUTTON_TEXT_SELECTOR = ".dx-button-text",
            ICON_CLASS = "dx-icon",
            ICON_SELECTOR = ".dx-icon",
            BUTTON_FEEDBACK_HIDE_TIMEOUT = 100;
        DX.registerComponent("dxButton", ui, ui.Widget.inherit({
            _supportedKeys: function() {
                var that = this,
                    click = function(e) {
                        e.preventDefault();
                        that._executeClickAction(e)
                    };
                return $.extend(this.callBase(), {
                        space: click,
                        enter: click
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    clickAction: {
                        since: "14.2",
                        alias: "onClick"
                    },
                    iconSrc: {
                        since: "15.1",
                        alias: "icon"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    onClick: null,
                    type: "normal",
                    text: "",
                    icon: "",
                    validationGroup: undefined,
                    activeStateEnabled: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                hoverStateEnabled: true,
                                focusStateEnabled: true
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = BUTTON_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this.element().addClass(BUTTON_CLASS).append($("<div>").addClass(BUTTON_CONTENT_CLASS));
                this.setAria("role", "button");
                this._renderClick();
                this._renderIcon();
                this._renderType();
                this._renderText();
                this._updateAriaLabel()
            },
            _renderClick: function() {
                var that = this,
                    eventName = events.addNamespace("dxclick", this.NAME);
                this._clickAction = this._createActionByOption("onClick");
                this.element().off(eventName).on(eventName, function(e) {
                    that._executeClickAction(e)
                })
            },
            _executeClickAction: function(e) {
                this._clickAction({
                    jQueryEvent: e,
                    validationGroup: DX.validationEngine.getGroupConfig(this._findGroup())
                })
            },
            _updateAriaLabel: function() {
                var icon = this.option("icon"),
                    type = this.option("type"),
                    text = this.option("text");
                icon = utils.getImageSourceType(icon) === "image" ? icon.replace(/.+\/([^\.]+)\..+$/, "$1") : icon;
                var ariaLabel = text || icon;
                if (type !== "normal")
                    ariaLabel = type + " " + ariaLabel;
                this.setAria("label", $.trim(ariaLabel))
            },
            _renderIcon: function() {
                var contentElement = this.element().find(BUTTON_CONTENT_SELECTOR),
                    iconElement = contentElement.find(ICON_SELECTOR),
                    icon = this.option("icon");
                iconElement.remove();
                if (this.option("type") === "back" && !icon)
                    icon = "back";
                var iconElement = utils.getImageContainer(icon);
                if (!iconElement)
                    return;
                contentElement.prepend(iconElement);
                this.element().addClass(BUTTON_HAS_ICON_CLASS)
            },
            _renderType: function() {
                var type = this.option("type");
                if (type)
                    this.element().addClass("dx-button-" + type)
            },
            _refreshType: function(prevType) {
                var type = this.option("type");
                prevType && this.element().removeClass("dx-button-" + prevType).addClass("dx-button-" + type);
                if (!this.element().hasClass("dx-button-has-icon") && type === "back")
                    this._renderIcon()
            },
            _renderText: function() {
                var text = this.option("text"),
                    contentElement = this.element().find(BUTTON_CONTENT_SELECTOR),
                    back = this.option("type") === "back";
                var textElement = contentElement.find(BUTTON_TEXT_SELECTOR);
                if (!text && !back) {
                    textElement.remove();
                    return
                }
                if (!textElement.length)
                    textElement = $('<span>').addClass(BUTTON_TEXT_CLASS).appendTo(contentElement);
                textElement.text(text || DX.localization.localizeString("@Back"));
                this.element().addClass(BUTTON_HAS_TEXT_CLASS)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"onClick":
                        this._renderClick();
                        break;
                    case"icon":
                        this._renderIcon();
                        this._updateAriaLabel();
                        break;
                    case"text":
                        this._renderText();
                        this._updateAriaLabel();
                        break;
                    case"type":
                        this._refreshType(args.previousValue);
                        this._updateAriaLabel();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _findGroup: DX.ui.validation.findGroup
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.checkBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var CHECKBOX_CLASS = "dx-checkbox",
            CHECKBOX_ICON_CLASS = "dx-checkbox-icon",
            CHECKBOX_CHECKED_CLASS = "dx-checkbox-checked",
            CHECKBOX_CONTAINER_CLASS = "dx-checkbox-container",
            CHECKBOX_CONTAINER_SELECTOR = ".dx-checkbox-container",
            CHECKBOX_TEXT_CLASS = "dx-checkbox-text",
            CHECKBOX_TEXT_SELECTOR = ".dx-checkbox-text",
            CHECKBOX_HAS_TEXT_CLASS = "dx-checkbox-has-text",
            CHECKBOX_INDETERMINATE_CLASS = "dx-checkbox-indeterminate",
            CHECKBOX_FEEDBACK_HIDE_TIMEOUT = 100,
            CHECKBOX_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", "dxCheckBox");
        DX.registerComponent("dxCheckBox", ui, ui.Editor.inherit({
            _supportedKeys: function() {
                var click = function(e) {
                        e.preventDefault();
                        this._clickAction({jQueryEvent: e})
                    };
                return $.extend(this.callBase(), {space: click})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: false,
                    text: ""
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                hoverStateEnabled: true,
                                focusStateEnabled: true
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this._feedbackHideTimeout = CHECKBOX_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.callBase();
                this.element().addClass(CHECKBOX_CLASS).append($("<div>").addClass(CHECKBOX_CONTAINER_CLASS));
                this.setAria("role", "checkbox");
                this._$container = this.element().find(CHECKBOX_CONTAINER_SELECTOR);
                this._renderClick();
                this._renderValue();
                this._renderIcon();
                this._renderText()
            },
            _renderDimensions: function() {
                this.callBase()
            },
            _renderIcon: function() {
                this._$icon = $("<span>").addClass(CHECKBOX_ICON_CLASS).prependTo(this._$container)
            },
            _renderText: function() {
                this._$text = this._$container.find(CHECKBOX_TEXT_SELECTOR);
                if (!this.option("text")) {
                    if (this._$text) {
                        this._$text.remove();
                        this.element().removeClass(CHECKBOX_HAS_TEXT_CLASS)
                    }
                    return
                }
                if (!this._$text.length)
                    this._$text = $("<span>").addClass(CHECKBOX_TEXT_CLASS);
                this._$text.text(this.option("text"));
                this._$container.append(this._$text);
                this.element().addClass(CHECKBOX_HAS_TEXT_CLASS)
            },
            _renderClick: function() {
                this._clickAction = this._createAction(this._clickHandler);
                this.element().off(CHECKBOX_DXCLICK_EVENT_NAME).on(CHECKBOX_DXCLICK_EVENT_NAME, $.proxy(function(e) {
                    this._clickAction({jQueryEvent: e})
                }, this))
            },
            _clickHandler: function(args) {
                var that = args.component;
                that._saveValueChangeEvent(args.jQueryEvent);
                that.option("value", !that.option("value"))
            },
            _renderValue: function() {
                var $element = this.element(),
                    checked = this.option("value"),
                    indeterminate = checked === undefined;
                $element.toggleClass(CHECKBOX_CHECKED_CLASS, Boolean(checked));
                $element.toggleClass(CHECKBOX_INDETERMINATE_CLASS, indeterminate);
                this.setAria("checked", indeterminate ? "mixed" : checked || "false")
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"value":
                        this._renderValue();
                        this.callBase(args);
                        break;
                    case"text":
                        this._renderText();
                        this._renderDimensions();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.switch.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx;
        var SWITCH_CLASS = "dx-switch",
            SWITCH_WRAPPER_CLASS = SWITCH_CLASS + "-wrapper",
            SWITCH_CONTAINER_CLASS = SWITCH_CLASS + "-container",
            SWITCH_INNER_CLASS = SWITCH_CLASS + "-inner",
            SWITCH_HANDLE_CLASS = SWITCH_CLASS + "-handle",
            SWITCH_ON_VALUE_CLASS = SWITCH_CLASS + "-on-value",
            SWITCH_ON_CLASS = SWITCH_CLASS + "-on",
            SWITCH_OFF_CLASS = SWITCH_CLASS + "-off",
            SWITCH_ANIMATION_DURATION = 100;
        DX.registerComponent("dxSwitch", ui, ui.Editor.inherit({
            _supportedKeys: function() {
                var isRTL = this.option("rtlEnabled");
                var click = function(e) {
                        e.preventDefault();
                        this._clickAction({jQueryEvent: e})
                    },
                    move = function(value, e) {
                        e.preventDefault();
                        e.stopPropagation();
                        this._animateValue(value)
                    };
                return $.extend(this.callBase(), {
                        space: click,
                        enter: click,
                        leftArrow: $.proxy(move, this, isRTL ? true : false),
                        rightArrow: $.proxy(move, this, isRTL ? false : true)
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    onText: Globalize.localize("dxSwitch-onText"),
                    offText: Globalize.localize("dxSwitch-offText"),
                    value: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                hoverStateEnabled: true,
                                focusStateEnabled: true
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this._animating = false;
                this._animationDuration = SWITCH_ANIMATION_DURATION
            },
            _createValueChangeAction: function() {
                this._valueChangeAction = this._createActionByOption("onValueChanged")
            },
            _render: function() {
                var element = this.element();
                this._$switchInner = $("<div>").addClass(SWITCH_INNER_CLASS);
                this._$handle = $("<div>").addClass(SWITCH_HANDLE_CLASS).appendTo(this._$switchInner);
                this._$labelOn = $("<div>").addClass(SWITCH_ON_CLASS).prependTo(this._$switchInner);
                this._$labelOff = $("<div>").addClass(SWITCH_OFF_CLASS).appendTo(this._$switchInner);
                this._$switchContainer = $("<div>").addClass(SWITCH_CONTAINER_CLASS).append(this._$switchInner);
                this._$switchWrapper = $("<div>").addClass(SWITCH_WRAPPER_CLASS).append(this._$switchContainer);
                element.addClass(SWITCH_CLASS).append(this._$switchWrapper);
                this.setAria("role", "button");
                this._createComponent(element, "dxSwipeable", {
                    elastic: false,
                    immediate: true,
                    onStart: $.proxy(this._swipeStartHandler, this),
                    onUpdated: $.proxy(this._swipeUpdateHandler, this),
                    onEnd: $.proxy(this._swipeEndHandler, this)
                });
                this._renderLabels();
                this.callBase();
                this._updateMarginBound();
                this._renderValue();
                this._renderClick()
            },
            _updateMarginBound: function() {
                this._marginBound = this._$switchContainer.outerWidth(true) - this._$handle.outerWidth()
            },
            _marginDirection: function() {
                return this.option("rtlEnabled") ? "Right" : "Left"
            },
            _offsetDirection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _renderPosition: function(state, swipeOffset) {
                var stateInt = state ? 1 : 0,
                    marginDirection = this._marginDirection(),
                    resetMarginDirection = marginDirection === "Left" ? "Right" : "Left";
                this._$switchInner.css("margin" + marginDirection, this._marginBound * (stateInt + swipeOffset - 1));
                this._$switchInner.css("margin" + resetMarginDirection, 0)
            },
            _validateValue: function() {
                var check = this.option("value");
                if (typeof check !== "boolean")
                    this._options["value"] = !!check
            },
            _renderClick: function() {
                var eventName = events.addNamespace("dxclick", this.NAME);
                this._clickAction = this._createAction($.proxy(this._clickHandler, this));
                this.element().off(eventName).on(eventName, $.proxy(function(e) {
                    this._clickAction({jQueryEvent: e})
                }, this))
            },
            _clickHandler: function(args) {
                var e = args.jQueryEvent;
                this._saveValueChangeEvent(e);
                if (this._animating || this._swiping)
                    return;
                this._animateValue(!this.option("value"))
            },
            _animateValue: function(value) {
                var startValue = this.option("value"),
                    endValue = value;
                if (startValue == endValue)
                    return;
                this._animating = true;
                var that = this,
                    marginDirection = this._marginDirection(),
                    resetMarginDirection = marginDirection === "Left" ? "Right" : "Left",
                    fromConfig = {},
                    toConfig = {};
                this._$switchInner.css("margin" + resetMarginDirection, 0);
                fromConfig["margin" + marginDirection] = (Number(startValue) - 1) * this._marginBound;
                toConfig["margin" + marginDirection] = (Number(endValue) - 1) * this._marginBound;
                fx.animate(this._$switchInner, {
                    from: fromConfig,
                    to: toConfig,
                    duration: this._animationDuration,
                    complete: function() {
                        that._animating = false;
                        that.option("value", endValue)
                    }
                })
            },
            _swipeStartHandler: function(e) {
                var state = this.option("value"),
                    rtlEnabled = this.option("rtlEnabled"),
                    maxOffOffset = rtlEnabled ? 0 : 1,
                    maxOnOffset = rtlEnabled ? 1 : 0;
                e.jQueryEvent.maxLeftOffset = state ? maxOffOffset : maxOnOffset;
                e.jQueryEvent.maxRightOffset = state ? maxOnOffset : maxOffOffset;
                this._swiping = true;
                this._toggleActiveState(this.element(), true)
            },
            _swipeUpdateHandler: function(e) {
                this._renderPosition(this.option("value"), this._offsetDirection() * e.jQueryEvent.offset)
            },
            _swipeEndHandler: function(e) {
                var that = this,
                    offsetDirection = this._offsetDirection(),
                    toConfig = {};
                toConfig["margin" + this._marginDirection()] = this._marginBound * (that.option("value") + offsetDirection * e.jQueryEvent.targetOffset - 1);
                fx.animate(this._$switchInner, {
                    to: toConfig,
                    duration: that._animationDuration,
                    complete: function() {
                        that._swiping = false;
                        var pos = that.option("value") + offsetDirection * e.jQueryEvent.targetOffset;
                        that.option("value", Boolean(pos));
                        that._toggleActiveState(that.element(), false)
                    }
                })
            },
            _renderValue: function() {
                this._validateValue();
                var val = this.option("value");
                this._renderPosition(val, 0);
                this.element().toggleClass(SWITCH_ON_VALUE_CLASS, val);
                this.setAria({
                    pressed: val,
                    label: val ? this.option("onText") : this.option("offText")
                })
            },
            _renderLabels: function() {
                this._$labelOn.text(this.option("onText"));
                this._$labelOff.text(this.option("offText"))
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this.repaint()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"visible":
                    case"width":
                        this._refresh();
                        break;
                    case"onText":
                    case"offText":
                        this._renderLabels();
                        break;
                    case"value":
                        this._renderValue();
                        this.callBase(args);
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textEditor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            inflector = DX.inflector;
        var TEXTEDITOR_CLASS = "dx-texteditor",
            TEXTEDITOR_INPUT_CLASS = "dx-texteditor-input",
            TEXTEDITOR_INPUT_SELECTOR = "." + TEXTEDITOR_INPUT_CLASS,
            TEXTEDITOR_CONTAINER_CLASS = "dx-texteditor-container",
            TEXTEDITOR_BUTTONS_CONTAINER_CLASS = "dx-texteditor-buttons-container",
            TEXTEDITOR_PLACEHOLDER_CLASS = "dx-placeholder",
            TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS = "dx-show-clear-button",
            TEXTEDITOR_ICON_CLASS = "dx-icon",
            TEXTEDITOR_CLEAR_ICON_CLASS = "dx-icon-clear",
            TEXTEDITOR_CLEAR_BUTTON_CLASS = "dx-clear-button-area",
            TEXTEDITOR_EMPTY_INPUT_CLASS = "dx-texteditor-empty",
            TEXTEDITOR_STATE_FOCUSED_CLASS = "dx-state-focused",
            EVENTS_LIST = ["keyDown", "keyPress", "keyUp", "change", "cut", "copy", "paste", "input"];
        DX.registerComponent("dxTextEditor", ui, ui.Editor.inherit({
            _supportedKeys: function() {
                var stop = function(e) {
                        e.stopPropagation()
                    };
                return {
                        space: stop,
                        enter: stop,
                        leftArrow: stop,
                        rightArrow: stop
                    }
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    keyDownAction: {
                        since: "14.2",
                        alias: "onKeyDown"
                    },
                    keyPressAction: {
                        since: "14.2",
                        alias: "onKeyPress"
                    },
                    keyUpAction: {
                        since: "14.2",
                        alias: "onKeyUp"
                    },
                    cutAction: {
                        since: "14.2",
                        alias: "onCut"
                    },
                    copyAction: {
                        since: "14.2",
                        alias: "onCopy"
                    },
                    pasteAction: {
                        since: "14.2",
                        alias: "onPaste"
                    },
                    changeAction: {
                        since: "14.2",
                        alias: "onChange"
                    },
                    inputAction: {
                        since: "14.2",
                        alias: "onInput"
                    },
                    focusInAction: {
                        since: "14.2",
                        alias: "onFocusIn"
                    },
                    focusOutAction: {
                        since: "14.2",
                        alias: "onFocusOut"
                    },
                    enterKeyAction: {
                        since: "14.2",
                        alias: "onEnterKey"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: "",
                    spellcheck: false,
                    showClearButton: false,
                    valueChangeEvent: "change",
                    placeholder: "",
                    attr: {},
                    onFocusIn: null,
                    onFocusOut: null,
                    onKeyDown: null,
                    onKeyPress: null,
                    onKeyUp: null,
                    onChange: null,
                    onInput: null,
                    onCut: null,
                    onCopy: null,
                    onPaste: null,
                    onEnterKey: null,
                    mode: "text",
                    hoverStateEnabled: true,
                    focusStateEnabled: true,
                    text: undefined,
                    valueFormat: function(value) {
                        return value
                    }
                })
            },
            _input: function() {
                return this.element().find(TEXTEDITOR_INPUT_SELECTOR).first()
            },
            _inputWrapper: function() {
                return this.element()
            },
            _buttonsContainer: function() {
                return this._inputWrapper().find("." + TEXTEDITOR_BUTTONS_CONTAINER_CLASS)
            },
            _render: function() {
                this.element().addClass(TEXTEDITOR_CLASS);
                this._renderInput();
                this._renderInputType();
                this._renderValue();
                this._renderProps();
                this._renderPlaceholder();
                this._renderEvents();
                this._renderEnterKeyAction();
                this._renderEmptinessEvent();
                this.callBase()
            },
            _renderInput: function() {
                $("<div>").addClass(TEXTEDITOR_CONTAINER_CLASS).append(this._createInput()).append($("<div>").addClass(TEXTEDITOR_BUTTONS_CONTAINER_CLASS)).appendTo(this.element())
            },
            _createInput: function() {
                return $("<input>").addClass(TEXTEDITOR_INPUT_CLASS).attr("autocomplete", "off").attr(this.option("attr"))
            },
            _renderValue: function() {
                this._renderInputValue();
                this._renderInputAddons()
            },
            _renderInputValue: function() {
                var text = this.option("text"),
                    value = this.option("value"),
                    displayValue = this.option("displayValue"),
                    valueFormat = this.option("valueFormat");
                if (displayValue !== undefined)
                    text = valueFormat(displayValue);
                else if (!DX.utils.isDefined(text))
                    text = valueFormat(value);
                if (this._input().val() !== (DX.utils.isDefined(text) ? text : ""))
                    this._renderDisplayText(text)
            },
            _renderDisplayText: function(text) {
                this._input().val(text);
                this._toggleEmptinessEventHandler()
            },
            _isValueValid: function() {
                var validity = this._input().get(0).validity;
                if (validity)
                    return validity.valid;
                return true
            },
            _toggleEmptiness: function(isEmpty) {
                this.element().toggleClass(TEXTEDITOR_EMPTY_INPUT_CLASS, isEmpty);
                this._togglePlaceholder(isEmpty)
            },
            _togglePlaceholder: function(isEmpty) {
                if (!this._$placeholder)
                    return;
                if (DX.browser["msie"])
                    this._$placeholder.toggle(!this._input().is(":focus") && isEmpty);
                else
                    this._$placeholder.toggle(isEmpty)
            },
            _renderProps: function() {
                this._toggleDisabledState(this.option("disabled"));
                this._toggleReadOnlyState(this._readOnlyPropValue());
                this._toggleSpellcheckState()
            },
            _toggleDisabledState: function() {
                this.callBase.apply(this, arguments);
                var $input = this._input();
                if (this.option("disabled"))
                    $input.attr("disabled", true).attr("tabindex", -1);
                else
                    $input.removeAttr("disabled").removeAttr("tabindex")
            },
            _toggleReadOnlyState: function(value) {
                this._input().prop("readOnly", value);
                this.callBase()
            },
            _readOnlyPropValue: function() {
                return this.option("readOnly")
            },
            _toggleSpellcheckState: function() {
                this._input().prop("spellcheck", this.option("spellcheck"))
            },
            _renderPlaceholder: function() {
                if (this._$placeholder) {
                    this._$placeholder.remove();
                    this._$placeholder = null
                }
                var that = this,
                    $input = that._input(),
                    placeholderText = that.option("placeholder"),
                    $placeholder = this._$placeholder = $('<div>').attr("data-dx_placeholder", placeholderText),
                    startEvent = events.addNamespace("dxpointerup", this.NAME);
                $placeholder.on(startEvent, function() {
                    $input.focus()
                });
                $placeholder.insertAfter($input);
                $placeholder.addClass(TEXTEDITOR_PLACEHOLDER_CLASS)
            },
            _placeholder: function() {
                return this._$placeholder || $()
            },
            _renderInputAddons: function() {
                this._renderClearButton()
            },
            _checkIfClearButtonShouldBeRendered: function() {
                return this.option("showClearButton") && !this.option("readOnly")
            },
            _renderClearButton: function() {
                var shouldClearButtonBeRendered = this._checkIfClearButtonShouldBeRendered();
                this.element().toggleClass(TEXTEDITOR_SHOW_CLEAR_BUTTON_CLASS, shouldClearButtonBeRendered);
                if (!shouldClearButtonBeRendered) {
                    this._$clearButton && this._$clearButton.remove();
                    this._$clearButton = null;
                    return
                }
                if (this._$clearButton)
                    return;
                this._$clearButton = this._createClearButton()
            },
            _createClearButton: function() {
                return $("<span>").addClass(TEXTEDITOR_CLEAR_BUTTON_CLASS).append($("<span>").addClass(TEXTEDITOR_ICON_CLASS).addClass(TEXTEDITOR_CLEAR_ICON_CLASS)).prependTo(this._buttonsContainer()).on(events.addNamespace("dxpointerdown", this.NAME), function(e) {
                        e.dxPreventBlur = true
                    }).on(events.addNamespace("dxclick", this.NAME), $.proxy(this._clearValueHandler, this))
            },
            _clearValueHandler: function(e) {
                var $input = this._input();
                e.stopPropagation();
                this.reset();
                if ($input.is(":focus")) {
                    $input.val("");
                    this._toggleEmptinessEventHandler()
                }
                else
                    $input.focus()
            },
            _renderEvents: function() {
                var that = this,
                    $input = that._input();
                that._renderValueChangeEvent();
                that._attachFocusEvents();
                $.each(EVENTS_LIST, function(_, event) {
                    var eventName = events.addNamespace(event.toLowerCase(), that.NAME),
                        action = that._createActionByOption("on" + inflector.camelize(event, true), {excludeValidators: ["readOnly"]});
                    $input.off(eventName).on(eventName, function(e) {
                        action({jQueryEvent: e})
                    })
                })
            },
            _keyUpHandler: function(e) {
                this.option("text", this._input().val())
            },
            _renderValueChangeEvent: function() {
                var that = this,
                    eventNamespace = this.NAME + "ValueChange";
                var keyUpNamespace = events.addNamespace(this._renderValueEventName(), this.NAME + "TextChange");
                this._input().off(keyUpNamespace).on(keyUpNamespace, $.proxy(this._keyUpHandler, this));
                var valueChangeEventNamespace = events.addNamespace(this.option("valueChangeEvent"), eventNamespace);
                this._input().off("." + eventNamespace).on(valueChangeEventNamespace, $.proxy(this._valueChangeEventHandler, this)).on("paste", $.proxy(this._pasteHandler, this))
            },
            _renderValueEventName: function() {
                return "input change keyup"
            },
            _focusTarget: function() {
                return this._input()
            },
            _pasteHandler: function(e) {
                clearTimeout(this._pasteTimer);
                this._pasteTimer = setTimeout($.proxy(this._valueChangeEventHandler, this, e))
            },
            _focusInHandler: function(e) {
                e.stopPropagation();
                this.element().addClass(TEXTEDITOR_STATE_FOCUSED_CLASS)
            },
            _focusOutHandler: function(e) {
                e.stopPropagation();
                this.element().removeClass(TEXTEDITOR_STATE_FOCUSED_CLASS)
            },
            _renderEmptinessEvent: function() {
                var $input = this._input();
                $input.on("input blur", $.proxy(this._toggleEmptinessEventHandler, this));
                this._toggleEmptinessEventHandler()
            },
            _toggleEmptinessEventHandler: function(value) {
                var value = this._input().val(),
                    isEmpty = (value === "" || value === null) && this._isValueValid();
                this._toggleEmptiness(isEmpty)
            },
            _valueChangeEventHandler: function(e, formattedValue) {
                this._saveValueChangeEvent(e);
                this.option("value", arguments.length > 1 ? formattedValue : this._input().val())
            },
            _renderEnterKeyAction: function() {
                if (this.option("onEnterKey")) {
                    this._enterKeyAction = this._createActionByOption("onEnterKey", {excludeValidators: ["readOnly"]});
                    this._input().on("keyup.onEnterKey.dxTextEditor", $.proxy(this._enterKeyHandlerUp, this))
                }
                else {
                    this._input().off("keyup.onEnterKey.dxTextEditor");
                    this._enterKeyAction = undefined
                }
            },
            _enterKeyHandlerUp: function(e) {
                if (e.which === 13)
                    this._enterKeyAction({jQueryEvent: e})
            },
            _updateValue: function() {
                this.option("text", undefined);
                this._renderValue()
            },
            _clean: function() {
                if (this._$placeholder) {
                    this._$placeholder.remove();
                    delete this._$placeholder
                }
                delete this._$clearButton;
                this.callBase()
            },
            _dispose: function() {
                clearTimeout(this._pasteTimer);
                this.callBase()
            },
            _optionChanged: function(args) {
                var name = args.name;
                if ($.inArray(inflector.camelize(name.replace("on", "")), EVENTS_LIST) > -1) {
                    this._renderEvents();
                    return
                }
                switch (name) {
                    case"valueChangeEvent":
                        this._renderValueChangeEvent();
                        break;
                    case"onValueChanged":
                        this._createValueChangeAction();
                        break;
                    case"readOnly":
                        this._toggleReadOnlyState(args.value);
                        this.callBase(args);
                        this._renderInputAddons();
                        break;
                    case"spellcheck":
                        this._toggleSpellcheckState();
                        break;
                    case"mode":
                        this._renderInputType();
                        break;
                    case"onEnterKey":
                        this._renderEnterKeyAction();
                        break;
                    case"placeholder":
                        this._invalidate();
                        break;
                    case"showClearButton":
                        this._renderInputAddons();
                        break;
                    case"text":
                        break;
                    case"value":
                        this._updateValue();
                        this.callBase(args);
                        break;
                    case"attr":
                        this._input().attr(args.value);
                        break;
                    case"valueFormat":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _renderInputType: function() {
                this._setInputType(this.option("mode"))
            },
            _setInputType: function(type) {
                var input = this._input();
                if (type === "search")
                    type = "text";
                try {
                    input.prop("type", type)
                }
                catch(e) {
                    input.prop("type", "text")
                }
            },
            focus: function() {
                this._input().focus()
            },
            blur: function() {
                if (this._input().is(document.activeElement))
                    DX.utils.resetActiveElement()
            },
            reset: function() {
                this.option("value", "")
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textEditor.mask.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var EMPTY_CHAR = " ";
        var EMPTY_CHAR_CODE = 32;
        var TEXTEDITOR_MASKED_CLASS = "dx-texteditor-masked";
        var MASK_EVENT_NAMESPACE = "dxMask";
        var FORWARD_DIRECTION = "forward";
        var BACKWARD_DIRECTION = "backward";
        var buildInMaskRules = {
                "0": /[0-9]/,
                "9": /[0-9\s]/,
                "#": /[-+0-9\s]/,
                L: /[a-zA-Z]/,
                l: /[a-zA-Z\s]/,
                C: /\S/,
                c: /./,
                A: /[0-9a-zA-Z]/,
                a: /[0-9a-zA-Z\s]/
            };
        DX.registerComponent("dxTextEditor", ui, ui.dxTextEditor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    mask: "",
                    maskChar: "_",
                    maskRules: {},
                    maskInvalidMessage: Globalize.localize("validation-mask")
                })
            },
            _supportedKeys: function() {
                var that = this;
                var keyHandlerMap = {
                        backspace: that._maskBackspaceHandler,
                        del: that._maskDelHandler,
                        enter: that._changeHandler
                    };
                var result = that.callBase();
                $.each(keyHandlerMap, function(key, callback) {
                    var parentHandler = result[key];
                    result[key] = function(e) {
                        that.option("mask") && callback.call(that, e);
                        parentHandler && parentHandler(e)
                    }
                });
                return result
            },
            _render: function() {
                this.callBase();
                this._renderMask()
            },
            _renderMask: function() {
                this.element().removeClass(TEXTEDITOR_MASKED_CLASS);
                this._maskRulesChain = null;
                if (!this.option("mask"))
                    return;
                this.element().addClass(TEXTEDITOR_MASKED_CLASS);
                this._attachMaskEventHandlers();
                this._parseMask();
                this._renderMaskedValue()
            },
            _attachMaskEventHandlers: function() {
                this._input().off("." + MASK_EVENT_NAMESPACE).on(events.addNamespace("focus", MASK_EVENT_NAMESPACE), $.proxy(this._maskFocusHandler, this)).on(events.addNamespace("keypress", MASK_EVENT_NAMESPACE), $.proxy(this._maskKeyPressHandler, this)).on(events.addNamespace("paste", MASK_EVENT_NAMESPACE), $.proxy(this._maskPasteHandler, this)).on(events.addNamespace("cut", MASK_EVENT_NAMESPACE), $.proxy(this._maskCutHandler, this)).on(events.addNamespace("drop", MASK_EVENT_NAMESPACE), $.proxy(this._maskDragHandler, this));
                this._attachChangeEventHandlers()
            },
            _attachChangeEventHandlers: function() {
                if ($.inArray("change", this.option("valueChangeEvent").split(" ")) === -1)
                    return;
                this._input().on(events.addNamespace("blur", MASK_EVENT_NAMESPACE), $.proxy(this._changeHandler, this))
            },
            _changeHandler: function(e) {
                this._valueChangeEventHandler(events.createEvent(e, {type: "change"}))
            },
            _parseMask: function() {
                this._maskRules = $.extend({}, buildInMaskRules, this.option("maskRules"));
                this._maskRulesChain = this._parseMaskRule(0)
            },
            _parseMaskRule: function(index) {
                var mask = this.option("mask");
                if (index >= mask.length)
                    return new ui.dxTextEditor.EmptyMaskRule;
                var result = this._getMaskRule(mask[index]);
                result.next(this._parseMaskRule(index + 1));
                return result
            },
            _getMaskRule: function(pattern) {
                var ruleConfig;
                $.each(this._maskRules, function(rulePattern, allowedChars) {
                    if (rulePattern === pattern) {
                        ruleConfig = {
                            pattern: rulePattern,
                            allowedChars: allowedChars
                        };
                        return false
                    }
                });
                return utils.isDefined(ruleConfig) ? new ui.dxTextEditor.MaskRule($.extend({maskChar: this.option("maskChar")}, ruleConfig)) : new ui.dxTextEditor.StubMaskRule({maskChar: pattern})
            },
            _renderMaskedValue: function() {
                if (!this._maskRulesChain)
                    return;
                var value = this.option("value");
                this._maskRulesChain.clear();
                this._handleChain({
                    value: value,
                    length: value.length
                });
                this._displayMask()
            },
            _displayMask: function() {
                var caret = this._caret();
                this._renderValue();
                this._caret(caret)
            },
            _renderValue: function() {
                if (this._maskRulesChain)
                    this.option("text", this._maskRulesChain.text());
                this.callBase()
            },
            _valueChangeEventHandler: function(e) {
                if (this._maskRulesChain) {
                    this._saveValueChangeEvent(e);
                    this.option("value", (this._value || "").replace(/\s+$/, ""));
                    return
                }
                this.callBase.apply(this, arguments)
            },
            _maskFocusHandler: function() {
                this._direction(FORWARD_DIRECTION);
                this._adjustCaret()
            },
            _maskKeyPressHandler: function(e) {
                this._maskKeyHandler(e, function() {
                    this._handleKey(e.which);
                    return true
                })
            },
            _maskBackspaceHandler: function(e) {
                this._maskKeyHandler(e, function() {
                    if (this._hasSelection())
                        return true;
                    if (this._tryMoveCaretBackward())
                        return false;
                    this._handleKey(EMPTY_CHAR_CODE, BACKWARD_DIRECTION);
                    return true
                })
            },
            _maskDelHandler: function(e) {
                this._maskKeyHandler(e, function() {
                    !this._hasSelection() && this._handleKey(EMPTY_CHAR_CODE);
                    return true
                })
            },
            _maskPasteHandler: function(e) {
                var caret = this._caret();
                this._maskKeyHandler(e, function() {
                    var pastingText = utils.clipboardText(e);
                    var restText = this._maskRulesChain.text().substring(caret.end);
                    var accepted = this._handleChain({
                            text: pastingText,
                            start: caret.start,
                            length: pastingText.length
                        });
                    var newCaret = caret.start + accepted;
                    this._handleChain({
                        text: restText,
                        start: newCaret,
                        length: restText.length
                    });
                    this._caret({
                        start: newCaret,
                        end: newCaret
                    });
                    return true
                })
            },
            _handleChain: function(args) {
                var handledCount = this._maskRulesChain.handle(args);
                this._value = this._maskRulesChain.value();
                return handledCount
            },
            _maskCutHandler: function(e) {
                var caret = this._caret();
                var selectedText = this._input().val().substring(caret.start, caret.end);
                this._maskKeyHandler(e, function() {
                    utils.clipboardText(e, selectedText);
                    return true
                })
            },
            _maskDragHandler: function() {
                this._clearDragTimer();
                this._dragTimer = setTimeout($.proxy(function() {
                    this.option("value", this._convertToValue(this._input().val()))
                }, this))
            },
            _convertToValue: function(text) {
                return text.replace(new RegExp(this.option("maskChar"), "g"), EMPTY_CHAR)
            },
            _maskKeyHandler: function(e, tryHandleKeyCallback) {
                this._direction(FORWARD_DIRECTION);
                e.preventDefault();
                this._handleSelection();
                if (!tryHandleKeyCallback.call(this))
                    return;
                this._direction(FORWARD_DIRECTION);
                this._adjustCaret();
                this._displayMask();
                this._maskRulesChain.reset()
            },
            _handleKey: function(keyCode, direction) {
                var char = String.fromCharCode(keyCode);
                this._direction(direction || FORWARD_DIRECTION);
                this._adjustCaret(char);
                this._handleKeyChain(char);
                this._moveCaret()
            },
            _handleSelection: function() {
                if (!this._hasSelection())
                    return;
                var caret = this._caret();
                var emptyChars = new Array(caret.end - caret.start + 1).join(EMPTY_CHAR);
                this._handleKeyChain(emptyChars)
            },
            _handleKeyChain: function(chars) {
                var caret = this._caret();
                var start = this._isForwardDirection() ? caret.start : caret.start - 1;
                var end = this._isForwardDirection() ? caret.end : caret.end - 1;
                var length = start === end ? 1 : end - start;
                this._handleChain({
                    text: chars,
                    start: start,
                    length: length
                })
            },
            _tryMoveCaretBackward: function() {
                this._direction(BACKWARD_DIRECTION);
                var currentCaret = this._caret().start;
                this._adjustCaret();
                return !currentCaret || currentCaret !== this._caret().start
            },
            _adjustCaret: function(char) {
                var caret = this._maskRulesChain.adjustedCaret(this._caret().start, this._isForwardDirection(), char);
                this._caret({
                    start: caret,
                    end: caret
                })
            },
            _moveCaret: function() {
                var currentCaret = this._caret().start;
                var maskRuleIndex = currentCaret + (this._isForwardDirection() ? 0 : -1);
                var caret = this._maskRulesChain.isAccepted(maskRuleIndex) ? currentCaret + (this._isForwardDirection() ? 1 : -1) : currentCaret;
                this._caret({
                    start: caret,
                    end: caret
                })
            },
            _caret: function(position) {
                if (!arguments.length)
                    return utils.caret(this._input());
                utils.caret(this._input(), position)
            },
            _hasSelection: function() {
                var caret = this._caret();
                return caret.start !== caret.end
            },
            _direction: function(direction) {
                if (!arguments.length)
                    return this._typingDirection;
                this._typingDirection = direction
            },
            _isForwardDirection: function() {
                return this._direction() === FORWARD_DIRECTION
            },
            _clearDragTimer: function() {
                clearTimeout(this._dragTimer)
            },
            _clean: function() {
                this._clearDragTimer();
                this.callBase()
            },
            _validateMask: function() {
                if (!this._maskRulesChain)
                    return;
                var isValid = this._maskRulesChain.isValid();
                this.option({
                    isValid: isValid,
                    validationError: isValid ? null : {
                        editorSpecific: true,
                        message: this.option("maskInvalidMessage")
                    }
                })
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"mask":
                    case"maskChar":
                    case"maskRules":
                        this._renderMask();
                        this._validateMask();
                        break;
                    case"value":
                        this._renderMaskedValue();
                        this._validateMask();
                        this.callBase(args);
                        break;
                    case"maskInvalidMessage":
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textEditor.mask.rule.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var EMPTY_CHAR = " ";
        var BaseMaskRule = DX.Class.inherit({
                ctor: function(config) {
                    this._value = EMPTY_CHAR;
                    $.extend(this, config)
                },
                next: function(rule) {
                    if (!arguments.length)
                        return this._next;
                    this._next = rule
                },
                text: $.noop,
                value: $.noop,
                rawValue: $.noop,
                handle: $.noop,
                _prepareHandlingArgs: function(args, config) {
                    var handlingProperty = args.hasOwnProperty("value") ? "value" : "text";
                    args[handlingProperty] = DX.utils.isDefined(config.str) ? config.str : args[handlingProperty];
                    args.start = DX.utils.isDefined(config.start) ? config.start : args.start;
                    args.length = DX.utils.isDefined(config.length) ? config.length : args.length;
                    return args
                },
                reset: $.noop,
                clear: $.noop,
                isAccepted: function() {
                    return false
                },
                adjustedCaret: function(caret, isForwardDirection, char) {
                    return isForwardDirection ? this._adjustedForward(caret, 0, char) : this._adjustedBackward(caret, 0, char)
                },
                _adjustedForward: $.noop,
                _adjustedBackward: $.noop,
                isValid: $.noop
            });
        var EmptyMaskRule = BaseMaskRule.inherit({
                next: $.noop,
                handle: function() {
                    return 0
                },
                text: function() {
                    return ""
                },
                value: function() {
                    return ""
                },
                rawValue: function() {
                    return ""
                },
                adjustedCaret: function() {
                    return 0
                },
                isValid: function() {
                    return true
                }
            });
        var MaskRule = BaseMaskRule.inherit({
                text: function() {
                    return (this._value !== EMPTY_CHAR ? this._value : this.maskChar) + this.next().text()
                },
                value: function() {
                    return this._value + this.next().value()
                },
                rawValue: function() {
                    return this._value + this.next().rawValue()
                },
                handle: function(args) {
                    var str = args.hasOwnProperty("value") ? args.value : args.text;
                    if (!str.length || !args.length)
                        return 0;
                    if (args.start)
                        return this.next().handle(this._prepareHandlingArgs(args, {start: args.start - 1}));
                    var char = str[0];
                    var rest = str.substring(1);
                    this._tryAcceptChar(char);
                    return this._accepted() ? this.next().handle(this._prepareHandlingArgs(args, {
                            str: rest,
                            length: args.length - 1
                        })) + 1 : this.handle(this._prepareHandlingArgs(args, {
                            str: rest,
                            length: args.length - 1
                        }))
                },
                clear: function() {
                    this._tryAcceptChar(EMPTY_CHAR);
                    this.next().clear()
                },
                reset: function() {
                    this._accepted(false);
                    this.next().reset()
                },
                _tryAcceptChar: function(char) {
                    this._accepted(false);
                    if (!this._isAllowed(char))
                        return;
                    this._accepted(true);
                    this._value = char
                },
                _accepted: function(value) {
                    if (!arguments.length)
                        return !!this._isAccepted;
                    this._isAccepted = !!value
                },
                _isAllowed: function(char) {
                    if (char === EMPTY_CHAR)
                        return true;
                    return this._isValid(char)
                },
                _isValid: function(char) {
                    var allowedChars = this.allowedChars;
                    if (allowedChars instanceof RegExp)
                        return allowedChars.test(char);
                    if ($.isFunction(allowedChars))
                        return allowedChars(char);
                    if ($.isArray(allowedChars))
                        return $.inArray(char, allowedChars) > -1;
                    return allowedChars === char
                },
                isAccepted: function(caret) {
                    return caret === 0 ? this._accepted() : this.next().isAccepted(caret - 1)
                },
                _adjustedForward: function(caret, index, char) {
                    if (index >= caret)
                        return index;
                    return this.next()._adjustedForward(caret, index + 1, char) || index + 1
                },
                _adjustedBackward: function(caret, index) {
                    if (index >= caret - 1)
                        return caret;
                    return this.next()._adjustedBackward(caret, index + 1) || index + 1
                },
                isValid: function() {
                    return this._isValid(this._value) && this.next().isValid()
                }
            });
        var StubMaskRule = MaskRule.inherit({
                value: function() {
                    return this.next().value()
                },
                handle: function(args) {
                    var hasValueProperty = args.hasOwnProperty("value");
                    var str = hasValueProperty ? args.value : args.text;
                    if (!str.length || !args.length)
                        return 0;
                    if (args.start || hasValueProperty)
                        return this.next().handle(this._prepareHandlingArgs(args, {start: args.start && args.start - 1}));
                    var char = str[0];
                    var rest = str.substring(1);
                    this._tryAcceptChar(char);
                    var nextArgs = this._isAllowed(char) ? this._prepareHandlingArgs(args, {
                            str: rest,
                            length: args.length - 1
                        }) : args;
                    return this.next().handle(nextArgs) + 1
                },
                clear: function() {
                    this._accepted(false);
                    this.next().clear()
                },
                _tryAcceptChar: function(char) {
                    this._accepted(this._isValid(char))
                },
                _isValid: function(char) {
                    return char === this.maskChar
                },
                _adjustedForward: function(caret, index, char) {
                    if (index >= caret && char === this.maskChar)
                        return index;
                    if (caret === index + 1 && this._accepted())
                        return caret;
                    return this.next()._adjustedForward(caret, index + 1, char)
                },
                _adjustedBackward: function(caret, index) {
                    if (index >= caret - 1)
                        return 0;
                    return this.next()._adjustedBackward(caret, index + 1)
                },
                isValid: function() {
                    return this.next().isValid()
                }
            });
        $.extend(ui.dxTextEditor, {
            MaskRule: MaskRule,
            StubMaskRule: StubMaskRule,
            EmptyMaskRule: EmptyMaskRule
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            devices = DX.devices,
            ua = window.navigator.userAgent,
            ignoreCode = [8, 9, 13, 33, 34, 35, 36, 37, 38, 39, 40, 46],
            TEXTBOX_CLASS = "dx-textbox",
            SEARCHBOX_CLASS = "dx-searchbox",
            ICON_CLASS = "dx-icon",
            SEARCH_ICON_CLASS = "dx-icon-search";
        DX.registerComponent("dxTextBox", ui, ui.dxTextEditor.inherit({
            ctor: function(element, options) {
                if (options)
                    this._showClearButton = options.showClearButton;
                this.callBase.apply(this, arguments)
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    mode: "text",
                    maxLength: null
                })
            },
            _render: function() {
                this.callBase();
                this.element().addClass(TEXTBOX_CLASS);
                this.setAria("role", "textbox");
                this._renderMaxLengthHandlers();
                this._renderSearchMode()
            },
            _renderMaxLengthHandlers: function() {
                if (this._isAndroid())
                    this._input().on(events.addNamespace("keydown", this.NAME), $.proxy(this._onKeyDownAndroidHandler, this)).on(events.addNamespace("change", this.NAME), $.proxy(this._onChangeAndroidHandler, this))
            },
            _getAriaTarget: function() {
                return this._input()
            },
            _renderProps: function() {
                this.callBase();
                this._toggleMaxLengthProp()
            },
            _toggleMaxLengthProp: function() {
                if (this._isAndroid())
                    return;
                var maxLength = this.option("maxLength");
                if (maxLength > 0)
                    this._input().attr("maxLength", maxLength);
                else
                    this._input().removeAttr("maxLength")
            },
            _renderSearchMode: function() {
                var $element = this._$element;
                if (this.option("mode") === "search") {
                    $element.addClass(SEARCHBOX_CLASS);
                    this._renderSearchIcon();
                    if (this._showClearButton === undefined) {
                        this._showClearButton = this.option("showClearButton");
                        this.option("showClearButton", true)
                    }
                }
                else {
                    $element.removeClass(SEARCHBOX_CLASS);
                    this._$searchIcon && this._$searchIcon.remove();
                    this.option("showClearButton", this._showClearButton === undefined ? this.option("showClearButton") : this._showClearButton);
                    delete this._showClearButton
                }
            },
            _renderSearchIcon: function() {
                var $searchIcon = $("<div>").addClass(ICON_CLASS).addClass(SEARCH_ICON_CLASS);
                $searchIcon.prependTo(this._input().parent());
                this._$searchIcon = $searchIcon
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"maxLength":
                        this._toggleMaxLengthProp();
                        this._renderMaxLengthHandlers();
                        break;
                    case"mode":
                        this._invalidate();
                    default:
                        this.callBase(args)
                }
            },
            _onKeyDownAndroidHandler: function(e) {
                var maxLength = this.option("maxLength");
                if (maxLength) {
                    var $input = $(e.target),
                        code = e.keyCode;
                    this._cutOffExtraChar($input);
                    return $input.val().length < maxLength || $.inArray(code, ignoreCode) !== -1 || window.getSelection().toString() !== ""
                }
                else
                    return true
            },
            _onChangeAndroidHandler: function(e) {
                var $input = $(e.target);
                if (this.option("maxLength"))
                    this._cutOffExtraChar($input)
            },
            _cutOffExtraChar: function($input) {
                var maxLength = this.option("maxLength"),
                    textInput = $input.val();
                if (textInput.length > maxLength)
                    $input.val(textInput.substr(0, maxLength))
            },
            _isAndroid: function() {
                var realDevice = devices.real();
                var version = realDevice.version.join(".");
                return realDevice.platform === "android" && version && /^(2\.|4\.1)/.test(version) && !/chrome/i.test(ua)
            }
        }));
        ui.dxTextBox.__internals = {
            uaAccessor: function(value) {
                if (!arguments.length)
                    return ui;
                ua = value
            },
            SEARCHBOX_CLASS: SEARCHBOX_CLASS,
            SEARCH_ICON_CLASS: SEARCH_ICON_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dropDownEditor.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            DROP_DOWN_EDITOR_CLASS = "dx-dropdowneditor",
            DROP_DOWN_EDITOR_READONLY_CLASS = "dx-dropdowneditor-readonly",
            DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS = "dx-dropdowneditor-input-wrapper",
            DROP_DOWN_EDITOR_BUTTON_CLASS = "dx-dropdowneditor-button",
            DROP_DOWN_EDITOR_BUTTON_ICON = "dx-dropdowneditor-icon",
            DROP_DOWN_EDITOR_OVERLAY = "dx-dropdowneditor-overlay",
            DROP_DOWN_EDITOR_OVERLAY_FLIPPED = "dx-dropdowneditor-overlay-flipped",
            DROP_DOWN_EDITOR_ACTIVE = "dx-dropdowneditor-active",
            DROP_DOWN_EDITOR_BUTTON_VISIBLE = "dx-dropdowneditor-button-visible",
            DROP_DOWN_EDITOR_FIELD_CLICKABLE = "dx-dropdowneditor-field-clickable",
            DROP_DOWN_EDITOR = "dxDropDownEditor",
            CLICK_EVENT_NAME = events.addNamespace("dxclick", DROP_DOWN_EDITOR);
        DX.registerComponent(DROP_DOWN_EDITOR, ui, ui.dxTextBox.inherit({
            _supportedKeys: function() {
                return $.extend(this.callBase(), {
                        escape: function(e) {
                            if (this.option("opened"))
                                e.preventDefault();
                            this.close()
                        },
                        upArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.altKey) {
                                this.close();
                                return false
                            }
                            return true
                        },
                        downArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.altKey) {
                                this._validatedOpening();
                                return false
                            }
                            return true
                        },
                        enter: function(e) {
                            if (this.option("opened")) {
                                e.preventDefault();
                                this._valueChangeEventHandler(e)
                            }
                            return true
                        }
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    openAction: {
                        since: "14.2",
                        alias: "onOpened"
                    },
                    closeAction: {
                        since: "14.2",
                        alias: "onClosed"
                    },
                    shownAction: {
                        since: "14.2",
                        alias: "onOpened"
                    },
                    hiddenAction: {
                        since: "14.2",
                        alias: "onClosed"
                    },
                    editEnabled: {
                        since: "14.2",
                        alias: "fieldEditEnabled"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: null,
                    onOpened: null,
                    onClosed: null,
                    opened: false,
                    fieldEditEnabled: true,
                    applyValueMode: "instantly",
                    fieldTemplate: null,
                    contentTemplate: null,
                    openOnFieldClick: false,
                    deferRendering: true,
                    showDropButton: true,
                    dropPosition: this._getDefaultDropPosition(),
                    focusStateEnabled: false,
                    applyButtonText: Globalize.localize("OK"),
                    cancelButtonText: Globalize.localize("Cancel"),
                    buttonsLocation: "default",
                    showPopupTitle: false
                })
            },
            _getDefaultDropPosition: function() {
                var position = this.option("rtlEnabled") ? "right" : "left";
                return {
                        offset: {
                            h: 0,
                            v: -1
                        },
                        my: position + " top",
                        at: position + " bottom",
                        collision: "flip flip"
                    }
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "generic"},
                            options: {dropPosition: {offset: {v: 0}}}
                        }])
            },
            _inputWrapper: function() {
                return this.element().find("." + DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS)
            },
            _init: function() {
                this.callBase();
                this._initVisibilityActions()
            },
            _initVisibilityActions: function() {
                this._openAction = this._createActionByOption("onOpened");
                this._closeAction = this._createActionByOption("onClosed")
            },
            _render: function() {
                this.callBase();
                this._renderOpenHandler();
                this.element().addClass(DROP_DOWN_EDITOR_CLASS);
                this._renderOpenedState();
                this.setAria("role", "combobox")
            },
            _renderContentImpl: function() {
                if (!this.option("deferRendering"))
                    this._createPopup()
            },
            _renderInput: function() {
                this.callBase();
                this.element().wrapInner($("<div>").addClass(DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS));
                this._$container = this.element().children().eq(0);
                this.setAria({
                    haspopup: "true",
                    autocomplete: "list"
                })
            },
            _readOnlyPropValue: function() {
                return !this.option("fieldEditEnabled") || this.callBase()
            },
            _renderField: function() {
                var fieldTemplate = this._getTemplateByOption("fieldTemplate");
                if (!(fieldTemplate && this.option("fieldTemplate")))
                    return;
                var isFocused = this._input().is(":focus");
                isFocused && this._input().focusout();
                this._cleanFocusState();
                var $container = this._$container;
                var data = this._fieldRenderData();
                $container.empty();
                this._$dropButton = null;
                this._$clearButton = null;
                fieldTemplate.render(data, $container);
                if (!this._input().length)
                    throw DX.Error("E1010");
                this._renderFocusState();
                isFocused && this._input().focus()
            },
            _fieldRenderData: function() {
                return this.option("value")
            },
            _renderInputAddons: function() {
                this._renderField();
                this.callBase();
                this._renderDropButton()
            },
            _renderDropButton: function(hideButton) {
                var dropButtonVisible = this.option("showDropButton");
                this.element().toggleClass(DROP_DOWN_EDITOR_BUTTON_VISIBLE, dropButtonVisible);
                if (!dropButtonVisible) {
                    this._$dropButton && this._$dropButton.remove();
                    this._$dropButton = null;
                    return
                }
                if (!this._$dropButton)
                    this._$dropButton = this._createDropButton().addClass(DROP_DOWN_EDITOR_BUTTON_CLASS);
                this._$dropButton.prependTo(this._buttonsContainer())
            },
            _createDropButton: function() {
                var $button = $("<div>");
                this._createComponent($button, "dxButton", {
                    focusStateEnabled: false,
                    disabled: this.option("readOnly")
                });
                var $buttonIcon = $("<div>").addClass(DROP_DOWN_EDITOR_BUTTON_ICON);
                $button.append($buttonIcon).removeClass("dx-button").on("mousedown", function(e) {
                    e.preventDefault()
                });
                $button.find(".dx-button-content").remove();
                return $button
            },
            _renderOpenHandler: function() {
                var $inputWrapper = this.element().find(".dx-dropdowneditor-input-wrapper");
                $inputWrapper.off(CLICK_EVENT_NAME);
                var openOnFieldClick = this.option("openOnFieldClick");
                this.element().toggleClass(DROP_DOWN_EDITOR_FIELD_CLICKABLE, openOnFieldClick);
                if (openOnFieldClick) {
                    $inputWrapper.on(events.addNamespace("mousedown", this.NAME), function(e) {
                        DX.devices.real().platform != "generic" && e.preventDefault()
                    });
                    $inputWrapper.on(CLICK_EVENT_NAME, $.proxy(this._openHandler, this));
                    return
                }
                if (this.option("showDropButton"))
                    this._$dropButton.dxButton("option", "onClick", $.proxy(this._openHandler, this))
            },
            _openHandler: function() {
                this._toggleOpenState()
            },
            _keyboardEventBindingTarget: function() {
                return this._input()
            },
            _toggleOpenState: function(isVisible) {
                isVisible = arguments.length ? isVisible : !this.option("opened");
                if (this.option("disabled") || this.option("readOnly"))
                    return;
                this._input().focus();
                this.option("opened", isVisible)
            },
            _renderOpenedState: function() {
                var opened = this.option("opened");
                if (opened)
                    this._createPopup();
                this.element().toggleClass(DROP_DOWN_EDITOR_ACTIVE, opened);
                this._setPopupOption("visible", opened);
                this.setAria("expanded", opened)
            },
            _createPopup: function() {
                if (this._$popup)
                    return;
                this._$popup = $("<div>").addClass(DROP_DOWN_EDITOR_OVERLAY).addClass(this.option("customOverlayCssClass")).appendTo(this.element());
                this._renderPopup();
                this._renderPopupContent()
            },
            _renderPopup: function() {
                this._popup = this._createComponent(this._$popup, "dxPopup", this._popupConfig());
                this._popup.on({
                    showing: $.proxy(this._popupShowingHandler, this),
                    shown: $.proxy(this._popupShownHandler, this),
                    hiding: $.proxy(this._popupHidingHandler, this),
                    hidden: $.proxy(this._popupHiddenHandler, this)
                });
                this._popup.option("onContentReady", $.proxy(this._contentReadyHandler, this));
                this._contentReadyHandler()
            },
            _contentReadyHandler: $.noop,
            _popupConfig: function() {
                return {
                        position: $.extend(this.option("dropPosition"), {of: this.element()}),
                        showTitle: this.option("showPopupTitle"),
                        width: "auto",
                        height: "auto",
                        shading: false,
                        closeOnTargetScroll: true,
                        closeOnOutsideClick: $.proxy(this._closeOutsideDropDownHandler, this),
                        animation: {
                            show: {
                                type: "fade",
                                duration: 0,
                                from: 0,
                                to: 1
                            },
                            hide: {
                                type: "fade",
                                duration: 400,
                                from: 1,
                                to: 0
                            }
                        },
                        deferRendering: false,
                        focusStateEnabled: false,
                        showCloseButton: false,
                        buttons: this._getPopupButtons(),
                        onPositioned: $.proxy(this._popupPositionedHandler, this)
                    }
            },
            _popupPositionedHandler: function(e) {
                this._popup.overlayContent().toggleClass(DROP_DOWN_EDITOR_OVERLAY_FLIPPED, e.position.v.flip)
            },
            _popupShowingHandler: $.noop,
            _popupHidingHandler: function() {
                this.option("opened", false)
            },
            _popupShownHandler: function() {
                this._openAction();
                if (this._$validationMessage) {
                    var myTop = DX.position(this.element()).top,
                        popupTop = DX.position(this._popup.content()).top;
                    this._$validationMessage.dxTooltip("option", "position", this._getValidationTooltipPosition(myTop + this.option("dropPosition").offset.v > popupTop ? "below" : "above"))
                }
            },
            _popupHiddenHandler: function() {
                this._closeAction();
                if (this._$validationMessage)
                    this._$validationMessage.dxTooltip("option", "position", this._getValidationTooltipPosition("below"))
            },
            _renderPopupContent: function() {
                var contentTemplate = this._getTemplateByOption("contentTemplate");
                if (!(contentTemplate && this.option("contentTemplate")))
                    return;
                var $popupContent = this._popup.content();
                $popupContent.empty();
                contentTemplate.render($popupContent)
            },
            _closeOutsideDropDownHandler: function(e) {
                var $target = $(e.target);
                var isInputClicked = !!$target.closest(this.element()).length;
                var isDropButtonClicked = !!$target.closest(this._$dropButton).length;
                var isOutsideClick = !isInputClicked && !isDropButtonClicked;
                return isOutsideClick
            },
            _clean: function() {
                delete this._$dropButton;
                if (this._$popup) {
                    this._$popup.remove();
                    delete this._$popup;
                    delete this._popup
                }
                this.callBase()
            },
            _setPopupOption: function(optionName, value) {
                this._setWidgetOption("_popup", arguments)
            },
            _validatedOpening: function() {
                if (!this.option("readOnly"))
                    this._toggleOpenState(true)
            },
            _getAriaTarget: function() {
                return this._input()
            },
            _getPopupButtons: function() {
                return this.option("applyValueMode") === "useButtons" ? this._popupButtonsConfig() : []
            },
            _popupButtonsConfig: function() {
                var buttonsConfig = [{
                            shortcut: "done",
                            options: {
                                onClick: $.proxy(this._applyButtonHandler, this),
                                text: this.option("applyButtonText")
                            }
                        }, {
                            shortcut: "cancel",
                            options: {
                                onClick: $.proxy(this._cancelButtonHandler, this),
                                text: this.option("cancelButtonText")
                            }
                        }];
                return this._applyButtonsLocation(buttonsConfig)
            },
            _applyButtonsLocation: function(buttonsConfig) {
                var buttonsLocation = this.option("buttonsLocation"),
                    resultConfig = buttonsConfig;
                if (buttonsLocation !== "default") {
                    var position = DX.utils.splitPair(buttonsLocation);
                    $.each(resultConfig, function(_, element) {
                        $.extend(element, {
                            toolbar: position[0],
                            location: position[1]
                        })
                    })
                }
                return resultConfig
            },
            _applyButtonHandler: function() {
                this.close();
                this.option("focusStateEnabled") && this.focus()
            },
            _cancelButtonHandler: function() {
                this.close();
                this.option("focusStateEnabled") && this.focus()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"opened":
                        this._renderOpenedState();
                        break;
                    case"onOpened":
                    case"onClosed":
                        this._initVisibilityActions();
                        break;
                    case"fieldTemplate":
                    case"fieldRender":
                        this._renderInputAddons();
                        break;
                    case"showDropButton":
                    case"contentTemplate":
                    case"contentRender":
                    case"fieldEditEnabled":
                    case"openOnFieldClick":
                        this._invalidate();
                        break;
                    case"dropPosition":
                    case"deferRendering":
                        break;
                    case"applyValueMode":
                    case"applyButtonText":
                    case"cancelButtonText":
                    case"buttonsLocation":
                        this._setPopupOption("buttons", this._getPopupButtons());
                        break;
                    case"showPopupTitle":
                        this._setPopupOption("showTitle", args.value);
                        break;
                    default:
                        this.callBase(args)
                }
            },
            open: function() {
                this.option("opened", true)
            },
            close: function() {
                this.option("opened", false)
            },
            reset: function() {
                this.option("value", null)
            },
            field: function() {
                return this._input()
            },
            content: function() {
                return this._popup ? this._popup.content() : null
            }
        }));
        ui.dxDropDownEditor.__internals = {
            DROP_DOWN_EDITOR_CLASS: DROP_DOWN_EDITOR_CLASS,
            DROP_DOWN_EDITOR_READONLY_CLASS: DROP_DOWN_EDITOR_READONLY_CLASS,
            DROP_DOWN_EDITOR_BUTTON_ICON: DROP_DOWN_EDITOR_BUTTON_ICON,
            DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS: DROP_DOWN_EDITOR_INPUT_WRAPPER_CLASS,
            DROP_DOWN_EDITOR_BUTTON_CLASS: DROP_DOWN_EDITOR_BUTTON_CLASS,
            DROP_DOWN_EDITOR_OVERLAY: DROP_DOWN_EDITOR_OVERLAY,
            DROP_DOWN_EDITOR_ACTIVE: DROP_DOWN_EDITOR_ACTIVE,
            DROP_DOWN_EDITOR_BUTTON_VISIBLE: DROP_DOWN_EDITOR_BUTTON_VISIBLE
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dropDownList.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var LIST_SELECTOR = ".dx-list",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            DROPDOWNLIST_SELECTED_CLASS = "dx-dropdownlist-selected",
            DROPDOWNLIST_POPUP_WRAPPER_CLASS = "dx-dropdownlist-popup-wrapper",
            SEARCH_MODES = ["startswith", "contains", "endwith", "notcontains"];
        DX.registerComponent("dxDropDownList", ui, ui.dxDropDownEditor.inherit({
            _supportedKeys: function() {
                return $.extend(this.callBase(), {
                        tab: function(e) {
                            if (this.option("opened") === true) {
                                var $focusedItem = this._list.option("focusedElement");
                                if ($focusedItem) {
                                    var $selectedItem = this._listSelectedItemElements();
                                    this._changeSelectedItem($selectedItem, $focusedItem);
                                    this.option("value", this._selectedItemValue())
                                }
                                this.close()
                            }
                            else
                                this._focusTarget().focusout()
                        },
                        space: $.noop,
                        home: $.noop,
                        end: $.noop
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, this._dataExpressionDeprecatedOptions(), {pagingEnabled: {
                        since: "15.1",
                        message: "Use the 'dataSource.paginate' option instead"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option($.extend(this._dataExpressionDefaultOptions(), {
                    displayValue: undefined,
                    searchEnabled: false,
                    searchMode: "contains",
                    searchTimeout: 500,
                    minSearchLength: 0,
                    searchExpr: null,
                    valueChangeEvent: "change keyup",
                    selectedItem: null,
                    pagingEnabled: undefined,
                    noDataText: Globalize.localize("dxCollectionWidget-noDataText"),
                    onSelectionChanged: null,
                    onItemClick: $.noop,
                    dropPosition: {
                        my: "left top",
                        at: "left bottom",
                        offset: {
                            h: 0,
                            v: 0
                        },
                        collision: "flip"
                    },
                    focusStateEnabled: true,
                    popupWidthExtension: 0
                }))
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {dropPosition: {offset: {v: -6}}}
                        }, {
                            device: function(device) {
                                return device.platform === "android"
                            },
                            options: {popupWidthExtension: 32}
                        }])
            },
            _setOptionsByReference: function() {
                this.callBase();
                $.extend(this._optionsByReference, {
                    value: true,
                    selectedItem: true,
                    displayValue: true
                })
            },
            _init: function() {
                this.callBase();
                this._initDataExpressions();
                this._initActions();
                this._setListDataSource();
                this._validateSearchMode();
                this._clearSelectedItem()
            },
            _initActions: function() {
                this._initContentReadyAction();
                this._initSelectionChangedAction();
                this._initItemClickAction()
            },
            _initContentReadyAction: function() {
                this._contentReadyAction = this._createActionByOption("onContentReady")
            },
            _initSelectionChangedAction: function() {
                this._selectionChangedAction = this._createActionByOption("onSelectionChanged", {excludeValidators: ["disabled", "readOnly"]})
            },
            _initItemClickAction: function() {
                this._itemClickAction = this._createActionByOption("onItemClick")
            },
            _renderContentImpl: function() {
                this.callBase();
                if (this.option("deferRendering"))
                    this._loadDataSource()
            },
            _renderField: function() {
                this.callBase();
                this._input().on("input", $.proxy(this._setFocusPolicy, this))
            },
            _preventFocusOnPopup: function(e) {
                if (this._list && this._list.initialOption("focusStateEnabled"))
                    e.preventDefault()
            },
            _createPopup: function() {
                this.callBase();
                this._popup._wrapper().addClass(this._popupWrapperClass());
                this._popup.content().off("mousedown").on("mousedown", $.proxy(this._preventFocusOnPopup, this))
            },
            _popupWrapperClass: function() {
                return DROPDOWNLIST_POPUP_WRAPPER_CLASS
            },
            _renderInputValue: function() {
                var callBase = $.proxy(this.callBase, this);
                return this._loadItem(this.option("value")).always($.proxy(function(item) {
                        this._setSelectedItem(item);
                        this._refreshSelected();
                        callBase()
                    }, this))
            },
            _loadItem: function(value) {
                var selectedItem = $.grep(this.option("items") || [], $.proxy(function(item) {
                        return this._isValueEquals(this._valueGetter(item), value)
                    }, this))[0];
                return selectedItem !== undefined ? $.Deferred().resolve(selectedItem).promise() : this._loadValue(value)
            },
            _setSelectedItem: function(item) {
                var displayValue = this._displayValue(item);
                this.option("selectedItem", item);
                this.option("displayValue", displayValue)
            },
            _displayValue: function(item) {
                return this._displayGetter(item)
            },
            _refreshSelected: function() {
                this._listItemElements().each($.proxy(function(_, itemElement) {
                    var $itemElement = $(itemElement);
                    var itemValue = this._valueGetter($itemElement.data(LIST_ITEM_DATA_KEY));
                    var isItemSelected = this._isSelectedValue(itemValue);
                    $itemElement.toggleClass(this._selectedItemClass(), isItemSelected);
                    if (isItemSelected)
                        this._list.selectItem($itemElement);
                    else
                        this._list.unselectItem($itemElement)
                }, this))
            },
            _popupShownHandler: function() {
                this.callBase();
                this._setFocusPolicy()
            },
            _setFocusPolicy: function() {
                if (!this.option("focusStateEnabled") || !this._list)
                    return;
                this._list.option("focusedElement", null)
            },
            _isSelectedValue: function(value) {
                return this._isValueEquals(value, this.option("value"))
            },
            _validateSearchMode: function() {
                var searchMode = this.option("searchMode"),
                    normalizedSearchMode = searchMode.toLowerCase();
                if ($.inArray(normalizedSearchMode, SEARCH_MODES) == -1)
                    throw DX.Error("E1019", searchMode);
            },
            _clearSelectedItem: function() {
                this.option("selectedItem", null)
            },
            _processDataSourceChanging: function() {
                this._setListDataSource();
                this._renderInputValue().fail($.proxy(this.reset, this))
            },
            reset: function() {
                this.option("value", null);
                this._clearSelectedItem()
            },
            _selectedItemClass: function() {
                return DROPDOWNLIST_SELECTED_CLASS
            },
            _listItemElements: function() {
                return this._$list ? this._$list.find(LIST_ITEM_SELECTOR) : $()
            },
            _listSelectedItemElements: function() {
                return this._$list ? this._$list.find("." + this._selectedItemClass()) : $()
            },
            _popupConfig: function() {
                return $.extend(this.callBase(), {width: this.option("width")})
            },
            _renderPopupContent: function() {
                this._renderList()
            },
            _attachChildKeyboardEvents: function() {
                this._childKeyboardProcessor = this._keyboardProcessor.attachChildProcessor();
                this._setListOption("_keyboardProcessor", this._childKeyboardProcessor)
            },
            _fireContentReadyAction: $.noop,
            _renderList: function() {
                var listId = (new DevExpress.data.Guid)._value,
                    $list = this._$list = $("<div>", {id: listId}).appendTo(this._popup.content());
                this._list = this._createComponent($list, "dxList", this._listConfig());
                this.setAria({
                    activedescendant: this._list.getFocusedItemId(),
                    owns: listId
                });
                this._refreshList()
            },
            _refreshList: function() {
                if (this._list && this._shouldRefreshDataSource())
                    this._setListDataSource()
            },
            _shouldRefreshDataSource: function() {
                var dataSourceProvided = !!this._list.option("dataSource");
                return dataSourceProvided !== this._isMinFilterLengthExceeded()
            },
            _refreshActiveDescendant: function() {
                this.setAria("activedescendant", "");
                this.setAria("activedescendant", this._list.getFocusedItemId())
            },
            _listConfig: function() {
                return {
                        _templates: this.option("_templates"),
                        templateProvider: this.option("templateProvider"),
                        noDataText: this.option("noDataText"),
                        onContentReady: $.proxy(this._listContentReadyHandler, this),
                        itemTemplate: this._getTemplateByOption("itemTemplate"),
                        indicateLoading: false,
                        tabIndex: -1,
                        onItemClick: $.proxy(this._listItemClickAction, this),
                        focusStateEnabled: this.option("focusStateEnabled"),
                        dataSource: this._isMinFilterLengthExceeded() ? this._dataSource : null,
                        _keyboardProcessor: this._childKeyboardProcessor,
                        onOptionChanged: $.proxy(function(args) {
                            if (args.name === "focusedElement")
                                this._refreshActiveDescendant()
                        }, this)
                    }
            },
            _dataSourceOptions: function() {
                this._suppressDeprecatedWarnings();
                var pagingEnabled = this.option("pagingEnabled");
                this._resumeDeprecatedWarnings();
                return {paginate: utils.ensureDefined(pagingEnabled, false)}
            },
            _listContentReadyHandler: function() {
                this._list = this._list || this._$list.dxList("instance");
                this.option().items = this._list.option("items");
                this._refreshSelected();
                this._dimensionChanged();
                this._contentReadyAction()
            },
            _setListOption: function(optionName, value) {
                this._setWidgetOption("_list", arguments)
            },
            _listItemClickAction: function(e) {
                this._listItemClickHandler(e);
                this._itemClickAction(e)
            },
            _listItemClickHandler: $.noop,
            _setListDataSource: function() {
                if (!this._list)
                    return;
                var isMinFilterLengthExceeded = this._isMinFilterLengthExceeded();
                this._setListOption("dataSource", isMinFilterLengthExceeded ? this._dataSource : null);
                if (!isMinFilterLengthExceeded)
                    this._setListOption("items", [])
            },
            _isMinFilterLengthExceeded: function() {
                return this._searchValue().toString().length >= this.option("minSearchLength")
            },
            _searchValue: function() {
                return this._input().val() || ""
            },
            _search: function() {
                if (!this._isMinFilterLengthExceeded()) {
                    this._searchCanceled();
                    return
                }
                var searchTimeout = this.option("searchTimeout");
                if (searchTimeout) {
                    if (!this._searchTimer)
                        this._searchTimer = setTimeout($.proxy(this._searchDataSource, this), searchTimeout)
                }
                else
                    this._searchDataSource()
            },
            _searchCanceled: function() {
                this._clearSearchTimer();
                this._refreshList()
            },
            _searchDataSource: function() {
                this._filterDataSource(this._searchValue())
            },
            _filterDataSource: function(searchValue) {
                var dataSource = this._dataSource;
                dataSource.searchExpr(this.option("searchExpr") || this._displayGetterExpr());
                dataSource.searchOperation(this.option("searchMode"));
                dataSource.searchValue(searchValue);
                dataSource.pageIndex(0);
                return dataSource.load().done($.proxy(this._dataSourceFiltered, this))
            },
            _clearFilter: function() {
                this._dataSource.searchValue("")
            },
            _dataSourceFiltered: function() {
                this._clearSearchTimer();
                this._refreshList();
                this._refreshPopupVisibility()
            },
            _refreshPopupVisibility: function() {
                this.option("opened", this._hasItemsToShow());
                if (this.option("opened"))
                    this._dimensionChanged()
            },
            _hasItemsToShow: function() {
                var resultItems = this._dataSource && this._dataSource.items() || [];
                var resultAmount = resultItems.length;
                var isMinFilterLengthExceeded = this._isMinFilterLengthExceeded();
                return isMinFilterLengthExceeded && resultAmount && this.element().hasClass("dx-state-focused")
            },
            _clearSearchTimer: function() {
                clearTimeout(this._searchTimer);
                delete this._searchTimer
            },
            _popupShowingHandler: function() {
                this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._popup && this._updatePopupDimensions()
            },
            _updatePopupDimensions: function() {
                this._updatePopupWidth();
                this._updatePopupHeight()
            },
            _updatePopupWidth: function() {
                this._setPopupOption("width", this.element().outerWidth() + this.option("popupWidthExtension"))
            },
            _updatePopupHeight: function() {
                var popupPadding = this._popup.overlayContent().outerHeight() - this._popup.content().height();
                var listMargin = this._list ? this._list.element().outerHeight() - this._list.clientHeight() : 0;
                var listHeight = this._list ? this._list.scrollHeight() + listMargin : 0;
                var popupHeight = Math.min(listHeight + popupPadding, this._getMaxHeight());
                this._setPopupOption("height", popupHeight);
                this._list && this._list.updateDimensions()
            },
            _getMaxHeight: function() {
                var $element = this.element(),
                    offset = $element.offset(),
                    windowHeight = $(window).height(),
                    maxHeight = Math.max(offset.top, windowHeight - offset.top - $element.outerHeight());
                return Math.min(windowHeight * 0.5, maxHeight)
            },
            _changeSelectedItem: function($selectedItem, $newItem) {
                var selectedItemClass = this._selectedItemClass();
                $selectedItem.removeClass(selectedItemClass);
                $newItem.addClass(selectedItemClass)
            },
            _selectedItemValue: function() {
                var $selectedItem = this._listSelectedItemElements();
                return this._valueGetter($selectedItem.data(LIST_ITEM_DATA_KEY))
            },
            _valueChangeArgs: function() {
                return $.extend(this.callBase.apply(this, arguments), {
                        selectedItem: this.option("selectedItem"),
                        itemData: this.option("selectedItem")
                    })
            },
            _clean: function() {
                if (this._list)
                    delete this._list;
                this.callBase()
            },
            _dispose: function() {
                this._clearSearchTimer();
                this.callBase()
            },
            _setCollectionWidgetOption: function() {
                this._setListOption.apply(this, arguments)
            },
            _optionChanged: function(args) {
                this._dataExpressionOptionChanged(args);
                switch (args.name) {
                    case"items":
                        if (!this.option("dataSource"))
                            this._processDataSourceChanging();
                        break;
                    case"dataSource":
                        this._processDataSourceChanging();
                        break;
                    case"valueExpr":
                    case"displayExpr":
                        this._renderValue();
                        break;
                    case"searchMode":
                        this._validateSearchMode();
                        break;
                    case"minSearchLength":
                        this._refreshList();
                        break;
                    case"searchEnabled":
                    case"searchExpr":
                    case"pagingEnabled":
                        this._invalidate();
                        break;
                    case"onContentReady":
                        this._initContentReadyAction();
                        break;
                    case"onSelectionChanged":
                        this._initSelectionChangedAction();
                        break;
                    case"onItemClick":
                        this._initItemClickAction();
                        break;
                    case"noDataText":
                        this._setListOption("noDataText");
                        break;
                    case"displayValue":
                        this.option("text", args.value);
                        break;
                    case"itemTemplate":
                    case"searchTimeout":
                    case"popupWidthExtension":
                        break;
                    case"selectedItem":
                        this._selectionChangedAction({selectedItem: args.value});
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }).include(ui.DataExpressionMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.textArea.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var TEXTAREA_CLASS = "dx-textarea",
            TEXTEDITOR_INPUT_CLASS = "dx-texteditor-input",
            TEXTEDITOR_CONTAINER_CLASS = "dx-texteditor-container";
        DX.registerComponent("dxTextArea", ui, ui.dxTextBox.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({spellcheck: true})
            },
            _render: function() {
                this.callBase();
                this.element().addClass(TEXTAREA_CLASS);
                this.setAria("multiline", "true")
            },
            _renderInput: function() {
                this.callBase();
                this._renderScrollHandler()
            },
            _createInput: function() {
                return $("<textarea>").addClass(TEXTEDITOR_INPUT_CLASS)
            },
            _renderScrollHandler: function() {
                var $input = this._input(),
                    eventY = 0;
                $input.on(events.addNamespace("dxpointerdown", this.NAME), function(e) {
                    eventY = events.eventData(e).y
                });
                $input.on(events.addNamespace("dxpointermove", this.NAME), function(e) {
                    var scrollTopPos = $input.scrollTop(),
                        scrollBottomPos = $input.prop("scrollHeight") - $input.prop("clientHeight") - scrollTopPos;
                    if (scrollTopPos === 0 && scrollBottomPos === 0)
                        return;
                    var currentEventY = events.eventData(e).y;
                    var isScrollFromTop = scrollTopPos === 0 && eventY >= currentEventY,
                        isScrollFromBottom = scrollBottomPos === 0 && eventY <= currentEventY,
                        isScrollFromMiddle = scrollTopPos > 0 && scrollBottomPos > 0;
                    if (isScrollFromTop || isScrollFromBottom || isScrollFromMiddle)
                        e.isScrollingEvent = true;
                    eventY = currentEventY
                })
            },
            _renderInputType: $.noop
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.numberBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            math = Math,
            events = ui.events,
            WIDGET_CLASS = "dx-numberbox",
            SPIN_CLASS = "dx-numberbox-spin",
            SPIN_CONTAINER_CLASS = "dx-numberbox-spin-container",
            SPIN_UP_CLASS = "dx-numberbox-spin-up",
            SPIN_DOWN_CLASS = "dx-numberbox-spin-down",
            SPIN_BUTTON_CLASS = "dx-numberbox-spin-button",
            SPIN_BUTTON_SELECTOR = "." + SPIN_BUTTON_CLASS,
            SPIN_TOUCH_FRIENDLY_CLASS = "dx-numberbox-spin-touch-friendly",
            SPIN_HOLD_DELAY = 100,
            CONTROL_KEYS = ["Tab", "Del", "Backspace", "Left", "Right", "Home", "End"],
            NUMBER_BOX = 'dxNumberBox',
            MOUSEWHEEL_EVENT_NAME = events.addNamespace("dxmousewheel", NUMBER_BOX),
            POINTERDOWN_EVENT_NAME = events.addNamespace("dxpointerdown", NUMBER_BOX),
            POINTERUP_EVENT_NAME = events.addNamespace("dxpointerup", NUMBER_BOX),
            POINTERCANCEL_EVENT_NAME = events.addNamespace("dxpointercancel", NUMBER_BOX);
        var androidNativeBrowser = DX.devices.real().android && navigator.userAgent.indexOf("Chrome") === -1;
        var dxSpinButton = ui.Widget.inherit({
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        direction: "up",
                        onChange: null,
                        activeStateEnabled: true,
                        hoverStateEnabled: false
                    })
                },
                _render: function() {
                    this.callBase();
                    var that = this,
                        $element = this.element(),
                        direction = SPIN_CLASS + "-" + this.option("direction");
                    $element.addClass(SPIN_BUTTON_CLASS).addClass(direction).off(POINTERDOWN_EVENT_NAME).on(POINTERDOWN_EVENT_NAME, $.proxy(this._spinDownHandler, this));
                    this._spinIcon = $("<div>").addClass(direction + "-icon").appendTo(this.element());
                    this._spinChangeHandler = this._createActionByOption("onChange")
                },
                _spinDownHandler: function(e) {
                    e.preventDefault();
                    this._clearTimer();
                    $(document).on("dxhold", $.proxy(function() {
                        this._spinChangeHandler({jQueryEvent: e});
                        this._holdTimer = setInterval(this._spinChangeHandler, SPIN_HOLD_DELAY, {jQueryEvent: e})
                    }, this)).on(POINTERUP_EVENT_NAME, $.proxy(this._clearTimer, this)).on(POINTERCANCEL_EVENT_NAME, $.proxy(this._clearTimer, this));
                    this._spinChangeHandler({jQueryEvent: e})
                },
                _dispose: function() {
                    this._clearTimer();
                    this.callBase()
                },
                _clearTimer: function(e) {
                    $(document).off(POINTERUP_EVENT_NAME).off(POINTERCANCEL_EVENT_NAME).off("dxhold");
                    if (this._holdTimer)
                        clearInterval(this._holdTimer)
                },
                _optionChanged: function(args) {
                    switch (args.name) {
                        case"onChange":
                        case"direction":
                            this._invalidate();
                            break;
                        default:
                            this.callBase(args)
                    }
                }
            });
        DX.registerComponent("dxNumberBox", ui, ui.dxTextEditor.inherit({
            _activeStateUnit: SPIN_BUTTON_SELECTOR,
            _supportedKeys: function() {
                return $.extend(this.callBase(), {
                        upArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            this._spinUpChangeHandler()
                        },
                        downArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            this._spinDownChangeHandler()
                        },
                        enter: function(e) {
                            this._input().trigger(this.option("valueChangeEvent"))
                        }
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: 0,
                    min: undefined,
                    max: undefined,
                    step: 1,
                    showSpinButtons: false,
                    useTouchSpinButtons: true,
                    mode: "number"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {useTouchSpinButtons: false}
                        }])
            },
            _render: function() {
                this.callBase();
                this.element().addClass(WIDGET_CLASS);
                this.setAria("role", "spinbutton");
                this._keyPressHandlerEvent();
                this._renderMouseWheelHandler()
            },
            _keyPressHandlerEvent: function() {
                var that = this;
                this._input().keypress(function(e) {
                    var ch = String.fromCharCode(e.which),
                        validCharRegExp = /[\d.,eE\-+]/,
                        isInputCharValid = validCharRegExp.test(ch);
                    if (!isInputCharValid) {
                        if (e.key && (e.ctrlKey || $.inArray(e.key, CONTROL_KEYS) >= 0))
                            return;
                        e.preventDefault();
                        return false
                    }
                    that._isIncompleteValue = false;
                    if (that._isValueIncomplete(that._input().val() + ch))
                        that._isIncompleteValue = true
                })
            },
            _isValueIncomplete: function(value) {
                var expRegex = /\d+[eE]$/,
                    dotRegex = /^[\.,]$/,
                    negRegex = /^-$/;
                return expRegex.test(value) || dotRegex.test(value) || negRegex.test(value)
            },
            _renderMouseWheelHandler: function(e) {
                var mouseWheelAction = this._createAction($.proxy(function(e) {
                        this._mouseWheelHandler(e.jQueryEvent)
                    }, this));
                this._input().off(MOUSEWHEEL_EVENT_NAME).on(MOUSEWHEEL_EVENT_NAME, function(e) {
                    mouseWheelAction({jQueryEvent: e})
                })
            },
            _mouseWheelHandler: function(e) {
                if (!this._input().is(":focus"))
                    return;
                e.delta > 0 ? this._spinValueChange(1) : this._spinValueChange(-1);
                e.preventDefault();
                e.stopPropagation()
            },
            _renderValue: function() {
                if (!this._input().val().length || this._input().val() != this.option("value")) {
                    this._forceValueRender();
                    this._toggleEmptinessEventHandler()
                }
                this._renderInputAddons();
                this.setAria("valuenow", this.option("value"))
            },
            _forceValueRender: function() {
                var $input = this._input(),
                    value = this.option("value"),
                    valueFormat = this.option("valueFormat");
                if (androidNativeBrowser) {
                    var inputType = $input.attr("type");
                    this._setInputType("text");
                    $input.val(valueFormat(value));
                    this._setInputType(inputType)
                }
                else
                    $input.val(valueFormat(value))
            },
            _getAriaTarget: function() {
                return this._input()
            },
            _renderProps: function() {
                this.callBase();
                this._input().prop({
                    min: this.option("min"),
                    max: this.option("max"),
                    step: this.option("step")
                });
                this.setAria({
                    valuemin: this.option("min") || "undefined",
                    valuemax: this.option("max") || "undefined"
                })
            },
            _renderInputAddons: function() {
                this.callBase();
                this._renderSpinButtons()
            },
            _renderSpinButtons: function() {
                var spinButtonsVisible = this.option("showSpinButtons");
                this.element().toggleClass(SPIN_CLASS, spinButtonsVisible);
                this._toggleTouchFriendlyClass();
                if (!spinButtonsVisible) {
                    this._$spinContainer && this._$spinContainer.remove();
                    this._$spinContainer = null;
                    return
                }
                if (!this._$spinContainer)
                    this._$spinContainer = this._createSpinButtons();
                this._$spinContainer.prependTo(this._buttonsContainer())
            },
            _toggleTouchFriendlyClass: function() {
                this.element().toggleClass(SPIN_TOUCH_FRIENDLY_CLASS, this.option("showSpinButtons") && this.option("useTouchSpinButtons"))
            },
            _createSpinButtons: function() {
                var pointerDownAction = this._createAction($.proxy(this._spinButtonsPointerDownHandler, this));
                var $spinContainer = $("<div>").addClass(SPIN_CONTAINER_CLASS).off(POINTERDOWN_EVENT_NAME).on(POINTERDOWN_EVENT_NAME, function(e) {
                        pointerDownAction({jQueryEvent: e})
                    });
                this._$spinUp = $("<div>").appendTo($spinContainer);
                this._createComponent(this._$spinUp, "dxSpinButton", {
                    direction: "up",
                    onChange: $.proxy(this._spinUpChangeHandler, this)
                });
                this._$spinDown = $("<div>").appendTo($spinContainer);
                this._createComponent(this._$spinDown, "dxSpinButton", {
                    direction: "down",
                    onChange: $.proxy(this._spinDownChangeHandler, this)
                });
                return $spinContainer
            },
            _spinButtonsPointerDownHandler: function(e) {
                e.dxPreventBlur = true;
                var $input = this._input();
                if (!this.option("useTouchSpinButtons") && document.activeElement !== $input[0])
                    $input.trigger("focus")
            },
            _spinUpChangeHandler: function() {
                if (!this.option("readOnly"))
                    this._spinValueChange(1)
            },
            _spinDownChangeHandler: function() {
                if (!this.option("readOnly"))
                    this._spinValueChange(-1)
            },
            _spinValueChange: function(sign) {
                var value = parseFloat(this._validationRequired() ? this._oldValue : this._normalizeInputValue()) || 0,
                    step = parseFloat(this.option("step"));
                value = this._correctRounding(value, step * sign);
                this.option("value", value)
            },
            _correctRounding: function(value, step) {
                var regex = /[,|.](.*)/;
                var isFloatValue = regex.test(value),
                    isFloatStep = regex.test(step);
                if (isFloatValue || isFloatStep) {
                    var valueAccuracy = isFloatValue ? regex.exec(value)[0].length : 0,
                        stepAccuracy = isFloatStep ? regex.exec(step)[0].length : 0,
                        accuracy = math.max(valueAccuracy, stepAccuracy);
                    value = this._round(value + step, accuracy);
                    return value
                }
                return value + step
            },
            _round: function(value, precision) {
                precision = precision || 0;
                var multiplier = Math.pow(10, precision);
                value *= multiplier;
                value = Math.round(value) / multiplier;
                return value
            },
            _renderValueChangeEvent: function() {
                this.callBase();
                this._input().focusout($.proxy(this._forceRefreshInputValue, this))
            },
            _forceRefreshInputValue: function() {
                var $input = this._input(),
                    valueFormat = this.option("valueFormat");
                $input.val(null);
                $input.val(valueFormat(this.option("value")))
            },
            _valueChangeEventHandler: function(e) {
                if (this._validationRequired()) {
                    this._inputInvalidHandler();
                    return
                }
                var $input = this._input(),
                    value = this._normalizeInputValue(),
                    valueFormat = this.option("valueFormat");
                if (this._isIncompleteValue)
                    return;
                if ($input.val() != value)
                    $input.val(valueFormat(this.option("value")), valueFormat(value));
                this.callBase(e, value)
            },
            _validationRequired: function() {
                return !this._isIncompleteValue && !this._validateValue(this._normalizeText())
            },
            _validateValue: function(value) {
                var isValueValid = this._isValueValid();
                if (!value && isValueValid) {
                    this.option("value", null);
                    return true
                }
                var isNumber = /^-?\d*\.?\d*$/.test(value),
                    isExponent = /^-?\d+e[-+]?\d+$/.test(value);
                this._oldValue = this.option("value");
                if (!isNumber && !isExponent && !isValueValid)
                    return false;
                return true
            },
            _inputInvalidHandler: function() {
                var $input = this._input(),
                    isValueDefined = DX.utils.isDefined(this._oldValue);
                this.option("value", isValueDefined ? this._oldValue : null);
                isValueDefined && $input.val(this._oldValue);
                this._oldValue = null
            },
            _normalizeInputValue: function() {
                var value = this._normalizeValue();
                return DX.utils.isDefined(value) ? value : this.option("value")
            },
            _normalizeValue: function(value) {
                return this._parseValue(this._normalizeText(value))
            },
            _normalizeText: function(value) {
                value = $.trim(DX.utils.isDefined(value) ? value : this._input().val());
                return value.replace(",", ".")
            },
            _parseValue: function(value) {
                var number = parseFloat(value);
                if (this.option("min") !== undefined)
                    number = math.max(number, this.option("min"));
                if (this.option("max") !== undefined)
                    number = math.min(number, this.option("max"));
                return number
            },
            _setValue: function(value, prevValue) {
                if (value == null || value === "") {
                    this.option("value", null);
                    if (value !== null)
                        this._suppressValueChangeAction();
                    return
                }
                var newValue = this._normalizeValue(value);
                if (!newValue && newValue !== 0) {
                    this.option("value", prevValue);
                    this._suppressValueChangeAction();
                    return
                }
                if (value !== newValue) {
                    this.option("value", newValue);
                    this._suppressValueChangeAction()
                }
            },
            _clean: function() {
                delete this._$spinContainer;
                delete this._$spinUp;
                delete this._$spinDown;
                this.callBase()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"value":
                        this._setValue(args.value, args.previousValue);
                        this.callBase(args);
                        this._resumeValueChangeAction();
                        break;
                    case"step":
                    case"min":
                    case"max":
                        this._renderProps();
                        break;
                    case"showSpinButtons":
                        this._renderInputAddons();
                        break;
                    case"useTouchSpinButtons":
                        this._toggleTouchFriendlyClass();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }));
        DX.registerComponent("dxSpinButton", ui.dxNumberBox, dxSpinButton);
        ui.dxNumberBox.__internals = {
            WIDGET_CLASS: WIDGET_CLASS,
            SPIN_CLASS: SPIN_CLASS,
            SPIN_CONTAINER_CLASS: SPIN_CONTAINER_CLASS,
            SPIN_UP_CLASS: SPIN_UP_CLASS,
            SPIN_DOWN_CLASS: SPIN_DOWN_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.radioButton.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var RADIO_BUTTON = "dxRadioButton",
            RADIO_BUTTON_CLASS = "dx-radiobutton",
            RADIO_BUTTON_ICON_CLASS = "dx-radiobutton-icon",
            RADIO_BUTTON_ICON_DOT_CLASS = "dx-radiobutton-icon-dot",
            RADIO_BUTTON_CHECKED_CLASS = "dx-radiobutton-checked",
            RADIO_BUTTON_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", RADIO_BUTTON);
        DX.registerComponent(RADIO_BUTTON, ui, ui.Editor.inherit({
            _supportedKeys: function() {
                var click = function(e) {
                        e.preventDefault();
                        this._clickAction({jQueryEvent: e})
                    };
                return $.extend(this.callBase(), {space: click})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({value: false})
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                focusStateEnabled: true,
                                hoverStateEnabled: true
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this.element().addClass(RADIO_BUTTON_CLASS)
            },
            _render: function() {
                this.callBase();
                this._renderIcon();
                this._renderCheckedState(this.option("value"));
                this._renderClick();
                this.setAria("role", "radio")
            },
            _renderIcon: function() {
                var $icon = $("<div>").addClass(RADIO_BUTTON_ICON_CLASS),
                    $dot = $("<div>").addClass(RADIO_BUTTON_ICON_DOT_CLASS).appendTo($icon);
                this.element().append($icon)
            },
            _renderCheckedState: function(checked) {
                this.element().toggleClass(RADIO_BUTTON_CHECKED_CLASS, checked);
                this.setAria("checked", checked)
            },
            _renderClick: function() {
                this._clickAction = this._createAction($.proxy(function(args) {
                    this._clickHandler(args.jQueryEvent)
                }, this));
                this.element().off(RADIO_BUTTON_DXCLICK_EVENT_NAME).on(RADIO_BUTTON_DXCLICK_EVENT_NAME, $.proxy(function(e) {
                    this._clickAction({jQueryEvent: e})
                }, this))
            },
            _clickHandler: function(e) {
                this._saveValueChangeEvent(e);
                this.option("value", true)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"value":
                        this._renderCheckedState(args.value);
                        this.callBase(args);
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.radioGroup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var RADIO_GROUP_CLASS = "dx-radiogroup",
            RADIO_GROUP_VERTICAL_CLASS = "dx-radiogroup-vertical",
            RADIO_GROUP_HORIZONTAL_CLASS = "dx-radiogroup-horizontal",
            RADIO_BUTTON_CLASS = "dx-radiobutton",
            RADIO_BUTTON_ICON_CLASS = "dx-radiobutton-icon",
            RADIO_BUTTON_ICON_DOT_CLASS = "dx-radiobutton-icon-dot",
            RADIO_VALUE_CONTAINER_CLASS = "dx-radio-value-container",
            RADIO_BUTTON_CHECKED_CLASS = "dx-radiobutton-checked",
            ITEM_DATA_KEY = "dxItemData",
            RADIO_FEEDBACK_HIDE_TIMEOUT = 100;
        var dxRadioCollection = ui.CollectionWidget.inherit({
                itemAttributes: function() {
                    return {role: "radio"}
                },
                _focusTarget: function() {
                    return this.element().parent()
                },
                _keyboardEventBindingTarget: function() {
                    return this._focusTarget()
                }
            });
        DX.registerComponent("dxRadioGroup", ui, ui.Editor.inherit({
            _activeStateUnit: "." + RADIO_BUTTON_CLASS,
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, this._dataExpressionDeprecatedOptions())
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option($.extend(this._dataExpressionDefaultOptions(), {layout: "vertical"}))
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {tablet: true},
                            options: {layout: "horizontal"}
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                focusStateEnabled: true,
                                hoverStateEnabled: true
                            }
                        }])
            },
            _setOptionsByReference: function() {
                this.callBase();
                $.extend(this._optionsByReference, {value: true})
            },
            _dataSourceOptions: function() {
                return {paginate: false}
            },
            _init: function() {
                this.callBase();
                this._initDataExpressions();
                this._feedbackHideTimeout = RADIO_FEEDBACK_HIDE_TIMEOUT
            },
            _render: function() {
                this.element().addClass(RADIO_GROUP_CLASS);
                this._renderRadios();
                this.setAria("role", "radiogroup");
                this.callBase();
                this._renderLayout();
                this._updateItemsSize()
            },
            _renderFocusState: $.noop,
            _renderRadios: function() {
                var $radios = $("<div>").appendTo(this.element());
                this._radios = this._createComponent($radios, "dxRadioCollection", {
                    dataSource: this._dataSource,
                    onItemRendered: $.proxy(this._itemRenderedHandler, this),
                    onItemClick: $.proxy(this._itemClickHandler, this),
                    itemTemplate: this._getTemplateByOption("itemTemplate"),
                    scrollingEnabled: false,
                    focusStateEnabled: this.option("focusStateEnabled"),
                    accessKey: this.option("accessKey"),
                    tabIndex: this.option("tabIndex"),
                    noDataText: "",
                    disabled: this.option("disabled")
                });
                this._setCollectionWidgetOption("onContentReady", $.proxy(this._contentReadyHandler, this));
                this._contentReadyHandler()
            },
            _contentReadyHandler: function() {
                this.itemElements().addClass(RADIO_BUTTON_CLASS);
                this._refreshSelected()
            },
            _itemRenderedHandler: function(e) {
                if (e.itemData.html)
                    return;
                var $radio = $("<div>").addClass(RADIO_BUTTON_ICON_CLASS),
                    $dot = $("<div>").addClass(RADIO_BUTTON_ICON_DOT_CLASS).appendTo($radio),
                    $radioContainer = $("<div>").append($radio).addClass(RADIO_VALUE_CONTAINER_CLASS);
                e.itemElement.prepend($radioContainer)
            },
            _itemClickHandler: function(e) {
                this.option("value", this._getItemValue(e.itemData))
            },
            _getItemValue: function(item) {
                return !!this._valueGetter ? this._valueGetter(item) : item.text
            },
            itemElements: function() {
                return this._radios.itemElements()
            },
            _renderDimensions: function() {
                this.callBase();
                this._updateItemsSize()
            },
            _renderLayout: function() {
                var layout = this.option("layout");
                this.element().toggleClass(RADIO_GROUP_VERTICAL_CLASS, layout === "vertical");
                this.element().toggleClass(RADIO_GROUP_HORIZONTAL_CLASS, layout === "horizontal")
            },
            _refreshSelected: function() {
                var selectedValue = this.option("value");
                this.itemElements().each($.proxy(function(_, item) {
                    var $item = $(item);
                    var itemValue = this._valueGetter($item.data(ITEM_DATA_KEY));
                    $item.toggleClass(RADIO_BUTTON_CHECKED_CLASS, this._isValueEquals(itemValue, selectedValue));
                    this.setAria("checked", this._isValueEquals(itemValue, selectedValue), $item)
                }, this))
            },
            _updateItemsSize: function() {
                if (this.option("layout") === "horizontal")
                    this.itemElements().css("height", "auto");
                else {
                    var itemsCount = this.option("items").length;
                    this.itemElements().css("height", 100 / itemsCount + "%")
                }
            },
            _setCollectionWidgetOption: function() {
                this._setWidgetOption("_radios", arguments)
            },
            _optionChanged: function(args) {
                this._dataExpressionOptionChanged(args);
                switch (args.name) {
                    case"focusStateEnabled":
                        this._setCollectionWidgetOption(args.name, args.value);
                        break;
                    case"dataSource":
                        this._setCollectionWidgetOption("dataSource");
                        break;
                    case"valueExpr":
                        this._refreshSelected();
                        break;
                    case"value":
                        this._refreshSelected();
                        this.callBase(args);
                        break;
                    case"items":
                    case"itemTemplate":
                    case"displayExpr":
                        break;
                    case"layout":
                        this._renderLayout();
                        this._updateItemsSize();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }).include(ui.DataExpressionMixin));
        DX.registerComponent("dxRadioCollection", ui.dxRadioGroup, dxRadioCollection)
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tabs.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            TABS_CLASS = "dx-tabs",
            TABS_WRAPPER_CLASS = "dx-indent-wrapper",
            TABS_EXPANDED_CLASS = "dx-tabs-expanded",
            TABS_SCROLLABLE_CLASS = "dx-scrollable-wrapper",
            TABS_NAV_BUTTONS_CLASS = "dx-tabs-nav-buttons",
            TABS_MARGIN = 25,
            TABS_ITEM_CLASS = "dx-tab",
            TABS_ITEM_SELECTOR = ".dx-tab",
            TABS_ITEM_SELECTED_CLASS = "dx-tab-selected",
            TABS_NAV_BUTTON_CLASS = "dx-tabs-nav-button",
            TABS_LEFT_NAV_BUTTON_CLASS = "dx-tabs-nav-button-left",
            TABS_RIGHT_NAV_BUTTON_CLASS = "dx-tabs-nav-button-right",
            TABS_ITEM_DATA_KEY = "dxTabData",
            FEEDBACK_HIDE_TIMEOUT = 100,
            FEEDBACK_DURATION_INTERVAL = 5,
            FEEDBACK_SCROLL_TIMEOUT = 300,
            ACTIVE_STATE_CLASS = "dx-state-active",
            SCROLLABLE_CONTENT_CLASS = "dx-scrollable-content",
            TAB_OFFSET = 30;
        DX.registerComponent("dxTabs", ui, ui.CollectionWidget.inherit({
            _activeStateUnit: TABS_ITEM_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    showNavButtons: false,
                    scrollByContent: true,
                    scrollingEnabled: true,
                    wordWrap: false,
                    selectionMode: "single",
                    activeStateEnabled: true,
                    selectionRequired: false,
                    selectOnFocus: true,
                    loopItemFocus: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {wordWrap: true}
                        }, {
                            device: {platform: "generic"},
                            options: {
                                showNavButtons: true,
                                scrollByContent: false
                            }
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                hoverStateEnabled: true,
                                focusStateEnabled: true
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this._renderMultiple();
                this.element().addClass(TABS_CLASS);
                this._feedbackHideTimeout = FEEDBACK_HIDE_TIMEOUT
            },
            _itemClass: function() {
                return TABS_ITEM_CLASS
            },
            _selectedItemClass: function() {
                return TABS_ITEM_SELECTED_CLASS
            },
            _itemDataKey: function() {
                return TABS_ITEM_DATA_KEY
            },
            _render: function() {
                this.element().removeClass(TABS_EXPANDED_CLASS);
                this.callBase();
                this._renderWrapper();
                if (this._allowScrolling()) {
                    this._renderScrollable();
                    this._renderNavButtons();
                    this._updateNavButtons()
                }
                else {
                    this.element().removeClass(TABS_NAV_BUTTONS_CLASS);
                    this.element().addClass(TABS_EXPANDED_CLASS)
                }
                this.setAria("role", "tablist");
                var that = this;
                this.itemElements().each(function(_, item) {
                    that.setAria("role", "tab", $(item))
                });
                this.element().addClass(ACTIVE_STATE_CLASS).removeClass(ACTIVE_STATE_CLASS)
            },
            _renderMultiple: function() {
                if (this.option("selectionMode") === "multi")
                    this.option("selectOnFocus", false)
            },
            _renderWrapper: function() {
                this.element().wrapInner($("<div>").addClass(TABS_WRAPPER_CLASS))
            },
            _renderScrollable: function() {
                var $itemContainer = this.element().wrapInner($("<div>").addClass(TABS_SCROLLABLE_CLASS)).children();
                this._scrollable = this._createComponent($itemContainer, "dxScrollable", {
                    direction: "horizontal",
                    showScrollbar: false,
                    useKeyboard: false,
                    useNative: false,
                    scrollByContent: this.option("scrollByContent"),
                    onScroll: $.proxy(this._updateNavButtonsVisibility, this)
                });
                this.element().append(this._scrollable.element())
            },
            _allowScrolling: function() {
                if (this.option("wordWrap"))
                    return false;
                if (!this.option("scrollingEnabled"))
                    return false;
                var tabItemsWidth = 0;
                this.itemElements().each(function(_, tabItem) {
                    tabItemsWidth += $(tabItem).outerWidth(true)
                });
                return tabItemsWidth - 1 > this.element().width()
            },
            _renderNavButtons: function() {
                this.element().toggleClass(TABS_NAV_BUTTONS_CLASS, this.option("showNavButtons"));
                if (this.option("showNavButtons")) {
                    this._leftButton = this._createNavButton(-TAB_OFFSET);
                    var $leftButton = this._leftButton.element();
                    $leftButton.addClass(TABS_LEFT_NAV_BUTTON_CLASS);
                    this.element().prepend($leftButton);
                    this._rightButton = this._createNavButton(TAB_OFFSET);
                    var $rightButton = this._rightButton.element();
                    $rightButton.addClass(TABS_RIGHT_NAV_BUTTON_CLASS);
                    this.element().append($rightButton);
                    this._updateNavButtonsVisibility();
                    this._scrollable.update();
                    if (this.option("rtlEnabled"))
                        this._scrollable.scrollTo({left: this._scrollable.scrollWidth() - this._scrollable.clientWidth()})
                }
            },
            _updateNavButtonsVisibility: function() {
                this._leftButton && this._leftButton.option("disabled", this._scrollable.scrollLeft() <= 0);
                this._rightButton && this._rightButton.option("disabled", this._scrollable.scrollLeft() >= this._scrollable.scrollWidth() - this._scrollable.clientWidth())
            },
            _updateScrollPosition: function(offset, duration) {
                this._scrollable.update();
                this._scrollable.scrollBy(offset / duration)
            },
            _createNavButton: function(offset) {
                var that = this;
                var holdAction = that._createAction(function() {
                        that._holdInterval = setInterval(function() {
                            that._updateScrollPosition(offset, FEEDBACK_DURATION_INTERVAL)
                        }, FEEDBACK_DURATION_INTERVAL)
                    }),
                    holdEventName = events.addNamespace('dxhold', "dxButton"),
                    pointerUpEventName = events.addNamespace('dxpointerup', "dxButton"),
                    pointerOutEventName = events.addNamespace('dxpointerout', "dxButton");
                var navButton = this._createComponent($("<div>").addClass(TABS_NAV_BUTTON_CLASS), "dxButton", {
                        focusStateEnabled: false,
                        onClick: function() {
                            that._updateScrollPosition(offset, 1)
                        }
                    });
                navButton.element().on(holdEventName, {timeout: FEEDBACK_SCROLL_TIMEOUT}, $.proxy(function(e) {
                    holdAction({jQueryEvent: e})
                }, this)).on(pointerUpEventName, function() {
                    that._clearInterval()
                }).on(pointerOutEventName, function() {
                    that._clearInterval()
                });
                return navButton
            },
            _clearInterval: function() {
                if (this._holdInterval)
                    clearInterval(this._holdInterval)
            },
            _updateNavButtons: function() {
                var $element = this.element(),
                    tabsHeight = $element.height();
                $element.find("." + TABS_LEFT_NAV_BUTTON_CLASS).css({height: tabsHeight});
                $element.find("." + TABS_RIGHT_NAV_BUTTON_CLASS).css({
                    height: tabsHeight,
                    "margin-top": -tabsHeight
                })
            },
            _renderSelection: function(addedSelection) {
                this._scrollable && this._scrollable.scrollToElement(this.itemElements().eq(addedSelection[0]))
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _dimensionChanged: function() {
                this._refresh()
            },
            _itemSelectHandler: function(e) {
                if (this.option("selectionMode") == "single" && this.isItemSelected(e.currentTarget))
                    return;
                this.callBase(e)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"wordWrap":
                    case"scrollingEnabled":
                    case"showNavButtons":
                        this._invalidate();
                        break;
                    case"scrollByContent":
                        this._scrollable && this._scrollable.option(args.name, args.value);
                        break;
                    case"selectionMode":
                        this._renderMultiple();
                        this.callBase(args);
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.navBar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            NAVBAR_CLASS = "dx-navbar",
            ITEM_CLASS = "dx-item-content",
            NAVBAR_ITEM_CLASS = "dx-nav-item",
            NAVBAR_ITEM_CONTENT_CLASS = "dx-nav-item-content",
            NAVBAR_ITEM_BADGE_CLASS = "dx-navbar-item-badge",
            BADGE_CLASS = "dx-badge";
        DX.registerComponent("dxNavBar", ui, ui.dxTabs.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({scrollingEnabled: false})
            },
            _render: function() {
                this.callBase();
                this.element().addClass(NAVBAR_CLASS)
            },
            _postprocessRenderItem: function(args) {
                this.callBase(args);
                var $itemElement = args.itemElement,
                    itemData = args.itemData;
                $itemElement.addClass(NAVBAR_ITEM_CLASS);
                $itemElement.find("." + ITEM_CLASS).addClass(NAVBAR_ITEM_CONTENT_CLASS);
                if (!itemData.icon && !itemData.iconSrc)
                    $itemElement.addClass("dx-navbar-text-item")
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.toolbar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator;
        var TOOLBAR_CLASS = "dx-toolbar",
            TOOLBAR_BOTTOM_CLASS = "dx-toolbar-bottom",
            TOOLBAR_MINI_CLASS = "dx-toolbar-mini",
            TOOLBAR_ITEM_CLASS = "dx-toolbar-item",
            TOOLBAR_LABEL_CLASS = "dx-toolbar-label",
            TOOLBAR_BUTTON_CLASS = "dx-toolbar-button",
            TOOLBAR_MENU_CONTAINER_CLASS = "dx-toolbar-menu-container",
            TOOLBAR_MENU_BUTTON_CLASS = "dx-toolbar-menu-button",
            TOOLBAR_ITEMS_CONTAINER_CLASS = "dx-toolbar-items-container",
            TOOLBAR_LABEL_SELECTOR = "." + TOOLBAR_LABEL_CLASS,
            TOOLBAR_ITEM_DATA_KEY = "dxToolbarItemDataKey",
            SUBMENU_SWIPE_EASING = "easeOutCubic",
            SUBMENU_HIDE_DURATION = 200,
            SUBMENU_SHOW_DURATION = 400;
        var slideSubmenu = function($element, position, isShowAnimation) {
                var duration = isShowAnimation ? SUBMENU_SHOW_DURATION : SUBMENU_HIDE_DURATION;
                fx.animate($element, {
                    type: "slide",
                    to: {top: position},
                    easing: SUBMENU_SWIPE_EASING,
                    duration: duration
                })
            };
        DX.registerComponent("dxToolbar", ui, ui.CollectionWidget.inherit({
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {menuItemRender: {
                        since: "14.2",
                        alias: "menuItemTemplate"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    menuItemTemplate: "menuItem",
                    submenuType: "dxDropDownMenu",
                    renderAs: "topToolbar"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "ios"},
                            options: {submenuType: "dxActionSheet"}
                        }, {
                            device: {platform: "android"},
                            options: {submenuType: "dxDropDownMenu"}
                        }, {
                            device: {platform: "win8"},
                            options: {submenuType: "dxList"}
                        }])
            },
            _itemContainer: function() {
                return this._$toolbarItemsContainer.find([".dx-toolbar-before", ".dx-toolbar-center", ".dx-toolbar-after"].join(","))
            },
            _itemClass: function() {
                return TOOLBAR_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TOOLBAR_ITEM_DATA_KEY
            },
            _dimensionChanged: function() {
                if (this._menu)
                    this._toggleMenuVisibility(false, true);
                this._arrangeTitle()
            },
            _render: function() {
                this._renderToolbar();
                this._renderSections();
                this.callBase();
                this._renderMenu();
                this._arrangeTitle();
                this.setAria("role", "toolbar")
            },
            _renderToolbar: function() {
                this.element().addClass(TOOLBAR_CLASS).toggleClass(TOOLBAR_BOTTOM_CLASS, this.option("renderAs") === "bottomToolbar");
                this._$toolbarItemsContainer = $("<div>").appendTo(this.element());
                this._$toolbarItemsContainer.addClass(TOOLBAR_ITEMS_CONTAINER_CLASS)
            },
            _renderSections: function() {
                var $container = this._$toolbarItemsContainer,
                    that = this;
                $.each(["before", "center", "after"], function() {
                    var sectionClass = "dx-toolbar-" + this,
                        $section = $container.find("." + sectionClass);
                    if (!$section.length)
                        that["_$" + this + "Section"] = $section = $("<div>").addClass(sectionClass).appendTo($container)
                })
            },
            _arrangeTitle: function() {
                if (this.element().is(":hidden"))
                    return;
                var $section = this._$toolbarItemsContainer.find(TOOLBAR_LABEL_SELECTOR).eq(0).parent(),
                    $label = $section.children(TOOLBAR_LABEL_SELECTOR).eq(0);
                if (!$label.length)
                    return;
                var containerWidth = this._$toolbarItemsContainer.width(),
                    labelOffset = this._$beforeSection.outerWidth() ? this._$beforeSection.outerWidth() : $label.position().left,
                    widthBeforeSection = $section.hasClass("dx-toolbar-before") ? 0 : labelOffset,
                    widthAfterSection = $section.hasClass("dx-toolbar-after") ? 0 : this._$afterSection.outerWidth(),
                    elemsAtSectionWidth = 10;
                $section.children().not(TOOLBAR_LABEL_SELECTOR).each(function() {
                    elemsAtSectionWidth += $(this).outerWidth()
                });
                var maxLabelWidth = containerWidth - widthBeforeSection - widthAfterSection - elemsAtSectionWidth,
                    labelLongerThanMax = $label.outerWidth() > maxLabelWidth;
                $section.css({
                    marginLeft: labelLongerThanMax ? widthBeforeSection : "",
                    marginRight: labelLongerThanMax ? widthAfterSection : ""
                });
                $label.css("max-width", maxLabelWidth)
            },
            _renderItem: function(index, item) {
                var location = item.location || "center",
                    container = this._$toolbarItemsContainer.find(".dx-toolbar-" + location),
                    itemHasTest = Boolean(item.text),
                    itemElement = this.callBase(index, item, container);
                itemElement.toggleClass(TOOLBAR_BUTTON_CLASS, !itemHasTest).toggleClass(TOOLBAR_LABEL_CLASS, itemHasTest);
                return itemElement
            },
            _hasVisibleMenuItems: function() {
                var menuItems = this._getMenuItems(),
                    result = false;
                var optionGetter = DevExpress.data.utils.compileGetter("visible");
                $.each(menuItems, function(index, item) {
                    var itemVisible = optionGetter(item, {functionsAsIs: true});
                    if (itemVisible !== false)
                        result = true
                });
                return result
            },
            _getToolbarItems: function() {
                return $.grep(this.option("items") || [], function(item) {
                        return item.location !== "menu"
                    })
            },
            _getMenuItems: function() {
                return $.grep(this.option("items") || [], function(item) {
                        return item.location === "menu"
                    })
            },
            _renderContentImpl: function() {
                var items = this._getToolbarItems();
                this.element().toggleClass(TOOLBAR_MINI_CLASS, items.length === 0);
                if (this._renderedItemsCount)
                    this._renderItems(items.slice(this._renderedItemsCount));
                else
                    this._renderItems(items)
            },
            _renderMenu: function() {
                var that = this,
                    itemClickAction = this._createActionByOption("onItemClick");
                var options = {
                        itemTemplate: function() {
                            if (that._menuType == "dxActionSheet")
                                return that._getTemplate("actionSheetItem");
                            return that._getTemplateByOption("menuItemTemplate")
                        },
                        onItemClick: function(e) {
                            that._toggleMenuVisibility(false, true);
                            itemClickAction(e)
                        }
                    };
                this._menuType = this.option("submenuType");
                if (this._menuType === "dxList" && this.option("renderAs") === "topToolbar")
                    this._menuType = "dxDropDownMenu";
                switch (this._menuType) {
                    case"dxActionSheet":
                        this._renderActionSheet(options);
                        break;
                    case"dxDropDownMenu":
                        this._renderDropDown(options);
                        break;
                    case"dxList":
                        this._renderList(options);
                        break
                }
            },
            _renderMenuButton: function(options) {
                var buttonOptions = $.extend({onClick: $.proxy(this._menuButtonClickHandler, this)}, options);
                this._renderMenuButtonContainer();
                this._$button = $("<div>").appendTo(this._$menuButtonContainer).addClass(TOOLBAR_MENU_BUTTON_CLASS);
                this._createComponent(this._$button, "dxButton", buttonOptions)
            },
            _renderMenuButtonContainer: function() {
                var $afterSection = this._$afterSection;
                this._$menuButtonContainer = $("<div>").appendTo($afterSection).addClass(TOOLBAR_BUTTON_CLASS).addClass(TOOLBAR_MENU_CONTAINER_CLASS)
            },
            _renderDropDown: function(options) {
                if (!this._hasVisibleMenuItems())
                    return;
                this._renderMenuButtonContainer();
                var $menu = $("<div>").appendTo(this._$menuButtonContainer);
                this._menu = this._createComponent($menu, "dxDropDownMenu", options);
                this._renderMenuItems()
            },
            _renderActionSheet: function(options) {
                if (!this._hasVisibleMenuItems())
                    return;
                this._renderMenuButton({icon: "overflow"});
                var actionSheetOptions = $.extend({
                        target: this._$button,
                        showTitle: false
                    }, options);
                var $menu = $("<div>").appendTo(this.element());
                this._menu = this._createComponent($menu, "dxActionSheet", actionSheetOptions);
                this._renderMenuItems()
            },
            _renderList: function(options) {
                this._renderMenuButton({
                    activeStateEnabled: false,
                    text: "..."
                });
                var listOptions = $.extend({
                        width: "100%",
                        indicateLoading: false
                    }, options);
                this._renderListOverlay();
                this._renderContainerSwipe();
                if (this._hasVisibleMenuItems()) {
                    var $menu = $("<div>").appendTo(this._listOverlay.content());
                    this._menu = this._createComponent($menu, "dxList", listOptions);
                    this._renderMenuItems()
                }
                this._changeListVisible(this.option("visible"))
            },
            _renderMenuItems: function() {
                this._menu.option("items", this._getMenuItems())
            },
            _getListHeight: function() {
                var listHeight = this._listOverlay.content().find(".dx-list").height(),
                    semiHiddenHeight = this._$toolbarItemsContainer.height() - this.element().height();
                return listHeight + semiHiddenHeight
            },
            _renderListOverlay: function() {
                var $listOverlay = $("<div>").appendTo(this.element());
                this._listOverlay = this._createComponent($listOverlay, "dxOverlay", {
                    container: false,
                    deferRendering: false,
                    shading: false,
                    height: "auto",
                    width: "100%",
                    showTitle: false,
                    closeOnOutsideClick: $.proxy(this._listOutsideClickHandler, this),
                    position: null,
                    animation: null,
                    closeOnBackButton: false
                })
            },
            _hideTopOverlayHandler: function() {
                this._toggleMenuVisibility(false, true)
            },
            _toggleHideTopOverlayCallback: function() {
                if (this._closeCallback)
                    DX.hideTopOverlayCallback.remove(this._closeCallback);
                if (this._menuShown) {
                    this._closeCallback = $.proxy(this._hideTopOverlayHandler, this);
                    DX.hideTopOverlayCallback.add(this._closeCallback)
                }
            },
            _renderContainerSwipe: function() {
                this._createComponent(this._$toolbarItemsContainer.appendTo(this._listOverlay.content()), "dxSwipeable", {
                    elastic: false,
                    onStart: $.proxy(this._swipeStartHandler, this),
                    onUpdated: $.proxy(this._swipeUpdateHandler, this),
                    onEnd: $.proxy(this._swipeEndHandler, this),
                    itemSizeFunc: $.proxy(this._getListHeight, this),
                    direction: "vertical"
                })
            },
            _listOutsideClickHandler: function(e) {
                if (!$(e.target).closest(this._listOverlay.content()).length)
                    this._toggleMenuVisibility(false, true)
            },
            _calculatePixelOffset: function(offset) {
                offset = (offset || 0) - 1;
                var maxOffset = this._getListHeight();
                return offset * maxOffset
            },
            _swipeStartHandler: function(e) {
                e.jQueryEvent.maxTopOffset = this._menuShown ? 0 : 1;
                e.jQueryEvent.maxBottomOffset = this._menuShown ? 1 : 0
            },
            _swipeUpdateHandler: function(e) {
                var offset = this._menuShown ? e.jQueryEvent.offset : 1 + e.jQueryEvent.offset;
                this._renderMenuPosition(offset, false)
            },
            _swipeEndHandler: function(e) {
                var targetOffset = e.jQueryEvent.targetOffset;
                targetOffset -= this._menuShown - 1;
                this._toggleMenuVisibility(targetOffset === 0, true)
            },
            _renderMenuPosition: function(offset, animate) {
                var pos = this._calculatePixelOffset(offset),
                    element = this._listOverlay.content();
                if (animate)
                    slideSubmenu(element, pos, this._menuShown);
                else
                    translator.move(element, {top: pos})
            },
            _menuButtonClickHandler: function() {
                this._toggleMenuVisibility(!this._menuShown, true)
            },
            _toggleMenuVisibility: function(visible, animate) {
                this._menuShown = visible;
                switch (this._menuType) {
                    case"dxList":
                        this._toggleHideTopOverlayCallback();
                        this._renderMenuPosition(this._menuShown ? 0 : 1, animate);
                        break;
                    case"dxActionSheet":
                        this._menu.toggle(this._menuShown);
                        this._menuShown = false;
                        break
                }
            },
            _renderEmptyMessage: $.noop,
            _clean: function() {
                this._$toolbarItemsContainer.children().empty();
                this.element().empty()
            },
            _changeMenuOption: function(name, value) {
                if (this._menu)
                    this._menu.option(name, value)
            },
            _changeListVisible: function(value) {
                if (this._listOverlay) {
                    this._listOverlay.option("visible", value);
                    this._toggleMenuVisibility(false, false)
                }
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._arrangeTitle()
            },
            _renderDimensions: function() {
                this.callBase();
                this._arrangeTitle()
            },
            _optionChanged: function(args) {
                var name = args.name;
                var value = args.value;
                switch (name) {
                    case"renderAs":
                    case"submenuType":
                        this._invalidate();
                        break;
                    case"visible":
                        this.callBase.apply(this, arguments);
                        this._changeListVisible(value);
                        break;
                    case"menuItemTemplate":
                        this._changeMenuOption("itemTemplate", this._getTemplate(value));
                        break;
                    case"onItemClick":
                        this._changeMenuOption(name, value);
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var LIST_CLASS = "dx-list",
            LIST_ITEM_CLASS = "dx-list-item",
            LIST_ITEM_SELECTOR = "." + LIST_ITEM_CLASS,
            LIST_GROUP_CLASS = "dx-list-group",
            LIST_GROUP_HEADER_CLASS = "dx-list-group-header",
            LIST_GROUP_BODY_CLASS = "dx-list-group-body",
            LIST_COLLAPSIBLE_GROUPS_CLASS = "dx-list-collapsible-groups",
            LIST_GROUP_COLLAPSED_CLASS = "dx-list-group-collapsed",
            LIST_HAS_NEXT_CLASS = "dx-has-next",
            LIST_NEXT_BUTTON_CLASS = "dx-list-next-button",
            LIST_ITEM_BADGE_CONTAINER_CLASS = "dx-list-item-badge-container",
            LIST_ITEM_BADGE_CLASS = "dx-list-item-badge",
            BADGE_CLASS = "dx-badge",
            LIST_ITEM_CHEVRON_CONTAINER_CLASS = "dx-list-item-chevron-container",
            LIST_ITEM_CHEVRON_CLASS = "dx-list-item-chevron",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            LIST_FEEDBACK_SHOW_TIMEOUT = 70;
        var groupItemsGetter = DX.data.utils.compileGetter("items");
        DX.registerComponent("dxList", ui, ui.CollectionWidget.inherit({
            _activeStateUnit: LIST_ITEM_SELECTOR,
            _supportedKeys: function() {
                var that = this;
                var moveFocusPerPage = function(direction) {
                        var $item = getEdgeVisibleItem(direction),
                            isFocusedItem = $item.get(0) == that.option("focusedElement").get(0);
                        if (isFocusedItem) {
                            scrollListTo($item, direction);
                            $item = getEdgeVisibleItem(direction)
                        }
                        that.option("focusedElement", $item);
                        that.scrollToItem($item)
                    };
                var getEdgeVisibleItem = function(direction) {
                        var scrollTop = that.scrollTop(),
                            containerHeight = that.element().height();
                        var $item = that.option("focusedElement"),
                            isItemVisible = true;
                        if (!$item)
                            return;
                        while (isItemVisible) {
                            var $nextItem = $item[direction]();
                            if (!$nextItem.length)
                                break;
                            var nextItemLocation = $nextItem.position().top + $nextItem.outerHeight() / 2;
                            isItemVisible = nextItemLocation < containerHeight + scrollTop && nextItemLocation > scrollTop;
                            if (isItemVisible)
                                $item = $nextItem
                        }
                        return $item
                    };
                var scrollListTo = function($item, direction) {
                        var resultPosition = $item.position().top;
                        if (direction === "prev")
                            resultPosition = $item.position().top - that.element().height() + $item.outerHeight();
                        that.scrollTo(resultPosition)
                    };
                return $.extend(this.callBase(), {
                        leftArrow: $.noop,
                        rightArrow: $.noop,
                        pageUp: function() {
                            moveFocusPerPage("prev");
                            return false
                        },
                        pageDown: function() {
                            moveFocusPerPage("next");
                            return false
                        }
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    itemSwipeAction: {
                        since: "14.2",
                        alias: "onItemSwipe"
                    },
                    scrollAction: {
                        since: "14.2",
                        alias: "onScroll"
                    },
                    pullRefreshAction: {
                        since: "14.2",
                        alias: "onPullRefresh"
                    },
                    pageLoadingAction: {
                        since: "14.2",
                        alias: "onPageLoading"
                    },
                    groupRender: {
                        since: "14.2",
                        alias: "groupTemplate"
                    },
                    autoPagingEnabled: {
                        since: "15.1",
                        message: "Use the 'pageLoadMode' option instead"
                    },
                    showNextButton: {
                        since: "15.1",
                        message: "Use the 'pageLoadMode' option instead"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    pullRefreshEnabled: false,
                    scrollingEnabled: true,
                    showScrollbar: "onScroll",
                    useNative: true,
                    bounceEnabled: true,
                    scrollByContent: true,
                    scrollByThumb: false,
                    pullingDownText: Globalize.localize("dxList-pullingDownText"),
                    pulledDownText: Globalize.localize("dxList-pulledDownText"),
                    refreshingText: Globalize.localize("dxList-refreshingText"),
                    pageLoadingText: Globalize.localize("dxList-pageLoadingText"),
                    onScroll: null,
                    onPullRefresh: null,
                    onPageLoading: null,
                    pageLoadMode: "scrollBottom",
                    nextButtonText: Globalize.localize("dxList-nextButtonText"),
                    onItemSwipe: null,
                    grouped: false,
                    onGroupRendered: null,
                    collapsibleGroups: false,
                    groupTemplate: "group",
                    indicateLoading: true,
                    activeStateEnabled: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat(ui.dxScrollable.deviceDependentOptions(), [{
                            device: function(device) {
                                return !DX.support.nativeScrolling && !DX.devices.isSimulator() && DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {
                                showScrollbar: "onHover",
                                pageLoadMode: "nextButton"
                            }
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                hoverStateEnabled: true,
                                focusStateEnabled: true
                            }
                        }])
            },
            _getOptionAliases: function() {
                return $.extend(this.callBase(), {useNative: "useNativeScrolling"})
            },
            _itemClass: function() {
                return LIST_ITEM_CLASS
            },
            _itemDataKey: function() {
                return LIST_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$container
            },
            _allowDinamicItemsAppend: function() {
                return true
            },
            _init: function() {
                this.callBase();
                this._$container = this.element();
                this._initScrollView();
                this._feedbackShowTimeout = LIST_FEEDBACK_SHOW_TIMEOUT;
                this._createGroupRenderAction()
            },
            _dataSourceOptions: function() {
                this._suppressDeprecatedWarnings();
                var pagingEnabled = this.option("autoPagingEnabled");
                pagingEnabled = utils.isDefined(this.option("showNextButton")) ? pagingEnabled || this.option("showNextButton") : pagingEnabled;
                this._resumeDeprecatedWarnings();
                return $.extend(this.callBase(), {paginate: utils.isDefined(pagingEnabled) ? pagingEnabled : true})
            },
            _initScrollView: function() {
                this._suppressDeprecatedWarnings();
                var scrollingEnabled = this.option("scrollingEnabled"),
                    pullRefreshEnabled = scrollingEnabled && this.option("pullRefreshEnabled"),
                    autoPagingEnabled = scrollingEnabled && utils.ensureDefined(this.option("autoPagingEnabled"), this.option("pageLoadMode") == "scrollBottom") && !!this._dataSource;
                this._resumeDeprecatedWarnings();
                this._scrollView = this._createComponent(this.element(), "dxScrollView", {
                    disabled: this.option("disabled") || !scrollingEnabled,
                    onScroll: $.proxy(this._scrollHandler, this),
                    onPullDown: pullRefreshEnabled ? $.proxy(this._pullDownHandler, this) : null,
                    onReachBottom: autoPagingEnabled ? $.proxy(this._scrollBottomHandler, this) : null,
                    showScrollbar: this.option("showScrollbar"),
                    useNative: this.option("useNativeScrolling"),
                    bounceEnabled: this.option("bounceEnabled"),
                    scrollByContent: this.option("scrollByContent"),
                    scrollByThumb: this.option("scrollByThumb"),
                    pullingDownText: this.option("pullingDownText"),
                    pulledDownText: this.option("pulledDownText"),
                    refreshingText: this.option("refreshingText"),
                    reachBottomText: this.option("pageLoadingText"),
                    useKeyboard: false
                });
                this._$container = this._scrollView.content();
                this._createScrollViewActions()
            },
            _createScrollViewActions: function() {
                this._scrollAction = this._createActionByOption("onScroll");
                this._pullRefreshAction = this._createActionByOption("onPullRefresh");
                this._pageLoadingAction = this._createActionByOption("onPageLoading")
            },
            _scrollHandler: function(e) {
                this._scrollAction(e)
            },
            _updateLoadingState: function(tryLoadMore) {
                this._suppressDeprecatedWarnings();
                var isDataLoaded = !tryLoadMore || this._isLastPage(),
                    autoPagingEnabled = utils.ensureDefined(this.option("autoPagingEnabled"), this.option("pageLoadMode") == "scrollBottom"),
                    stopLoading = isDataLoaded || !autoPagingEnabled,
                    hideLoadIndicator = stopLoading && !this._isDataSourceLoading();
                this._resumeDeprecatedWarnings();
                if (stopLoading || this._scrollViewIsFull()) {
                    this._scrollView.release(hideLoadIndicator);
                    this._toggleNextButton(this._shouldRenderNextButton() && !isDataLoaded);
                    this._loadIndicationSuppressed(false)
                }
                else
                    this._infiniteDataLoading()
            },
            _shouldRenderNextButton: function() {
                this._suppressDeprecatedWarnings();
                var result = utils.ensureDefined(this.option("showNextButton"), this.option("pageLoadMode") == "nextButton") && this._dataSource && this._dataSource.isLoaded();
                this._resumeDeprecatedWarnings();
                return result
            },
            _dataSourceLoadingChangedHandler: function(isLoading) {
                if (this._loadIndicationSuppressed())
                    return;
                if (isLoading && this.option("indicateLoading"))
                    this._showLoadingIndicatorTimer = setTimeout($.proxy(function() {
                        this._scrollView && this._scrollView.startLoading()
                    }, this));
                else {
                    clearTimeout(this._showLoadingIndicatorTimer);
                    this._scrollView && this._scrollView.finishLoading()
                }
            },
            _hideLoadingIfLoadIndicationOff: function() {
                if (!this.option("indicateLoading"))
                    this._dataSourceLoadingChangedHandler(false)
            },
            _loadIndicationSuppressed: function(value) {
                if (!arguments.length)
                    return this._isLoadIndicationSuppressed;
                this._isLoadIndicationSuppressed = value
            },
            _scrollViewIsFull: function() {
                return !this._scrollView || this._scrollView.isFull()
            },
            _pullDownHandler: function(e) {
                this._pullRefreshAction(e);
                if (this._dataSource && !this._isDataSourceLoading()) {
                    this._dataSource.pageIndex(0);
                    this._dataSource.load()
                }
                else
                    this._updateLoadingState()
            },
            _infiniteDataLoading: function() {
                if (!this._scrollViewIsFull() && !this._isDataSourceLoading() && !this._isLastPage()) {
                    clearTimeout(this._loadNextPageTimer);
                    this._loadNextPageTimert = setTimeout($.proxy(this._loadNextPage, this))
                }
            },
            _scrollBottomHandler: function(e) {
                this._pageLoadingAction(e);
                if (!this._isDataSourceLoading())
                    this._loadNextPage();
                else
                    this._updateLoadingState()
            },
            itemAttributes: function() {
                return {role: "option"}
            },
            _renderItems: function(items) {
                if (this.option("grouped")) {
                    $.each(items, $.proxy(this._renderGroup, this));
                    this._attachGroupCollapseEvent();
                    this._renderEmptyMessage()
                }
                else
                    this.callBase.apply(this, arguments);
                this._updateLoadingState(true)
            },
            _attachGroupCollapseEvent: function() {
                var eventName = events.addNamespace("dxclick", this.NAME),
                    selector = "." + LIST_GROUP_HEADER_CLASS,
                    $element = this.element(),
                    collapsibleGroups = this.option("collapsibleGroups");
                $element.toggleClass(LIST_COLLAPSIBLE_GROUPS_CLASS, collapsibleGroups);
                $element.off(eventName, selector);
                if (collapsibleGroups)
                    $element.on(eventName, selector, $.proxy(function(e) {
                        this._createAction($.proxy(function(e) {
                            this._collapseGroupHandler($(e.jQueryEvent.currentTarget).parent())
                        }, this), {validatingTargetName: "element"})({jQueryEvent: e})
                    }, this))
            },
            _collapseGroupHandler: function($group, toggle) {
                var deferred = $.Deferred(),
                    $groupBody = $group.children("." + LIST_GROUP_BODY_CLASS);
                $group.toggleClass(LIST_GROUP_COLLAPSED_CLASS, toggle);
                var slideMethod = "slideToggle";
                if (toggle === true)
                    slideMethod = "slideUp";
                if (toggle === false)
                    slideMethod = "slideDown";
                $groupBody[slideMethod]({
                    duration: 200,
                    complete: function() {
                        deferred.resolve()
                    }
                });
                return deferred.promise()
            },
            _dataSourceLoadErrorHandler: function() {
                this._forgetNextPageLoading();
                if (this._initialized) {
                    this._renderEmptyMessage();
                    this._updateLoadingState()
                }
            },
            _render: function() {
                this.element().addClass(LIST_CLASS);
                this.callBase();
                this.setAria("role", "listbox")
            },
            _postprocessRenderItem: function(args) {
                this.callBase.apply(this, arguments);
                if (this.option("onItemSwipe"))
                    this._attachSwipeEvent($(args.itemElement))
            },
            _attachSwipeEvent: function($itemElement) {
                var endEventName = events.addNamespace("dxswipeend", this.NAME);
                $itemElement.on(endEventName, $.proxy(this._itemSwipeEndHandler, this))
            },
            _itemSwipeEndHandler: function(e) {
                this._itemJQueryEventHandler(e, "onItemSwipe", {direction: e.offset < 0 ? "left" : "right"})
            },
            _nextButtonHandler: function() {
                var source = this._dataSource;
                if (source && !source.isLoading()) {
                    this._scrollView.toggleLoading(true);
                    this._$nextButton.detach();
                    this._loadIndicationSuppressed(true);
                    this._loadNextPage()
                }
            },
            _renderGroup: function(index, group) {
                var $groupElement = $("<div>").addClass(LIST_GROUP_CLASS).appendTo(this._itemContainer());
                var $groupHeaderElement = $("<div>").addClass(LIST_GROUP_HEADER_CLASS).appendTo($groupElement);
                var groupTemplateName = this.option("groupTemplate"),
                    groupTemplate = this._getTemplate(group.template || groupTemplateName, group, index, $groupHeaderElement),
                    renderArgs = {
                        index: index,
                        item: group,
                        container: $groupHeaderElement
                    };
                this._createItemByTemplate(groupTemplate, renderArgs);
                this._renderingGroupIndex = index;
                var $groupBody = $("<div>").addClass(LIST_GROUP_BODY_CLASS).appendTo($groupElement);
                $.each(groupItemsGetter(group) || [], $.proxy(function(index, item) {
                    this._renderItem(index, item, $groupBody)
                }, this));
                this._groupRenderAction({
                    groupElement: $groupElement,
                    groupIndex: index,
                    groupData: group
                })
            },
            _createGroupRenderAction: function() {
                this._groupRenderAction = this._createActionByOption("onGroupRendered")
            },
            _clean: function() {
                if (this._$nextButton) {
                    this._$nextButton.remove();
                    this._$nextButton = null
                }
                this.callBase.apply(this, arguments)
            },
            _dispose: function() {
                clearTimeout(this._holdTimer);
                clearTimeout(this._loadNextPageTimer);
                clearTimeout(this._showLoadingIndicatorTimer);
                this.callBase()
            },
            _toggleDisabledState: function(value) {
                this.callBase(value);
                this._scrollView.option("disabled", value || !this.option("scrollingEnabled"))
            },
            _toggleNextButton: function(value) {
                var dataSource = this._dataSource,
                    $nextButton = this._getNextButton();
                this.element().toggleClass(LIST_HAS_NEXT_CLASS, value);
                if (value && dataSource && dataSource.isLoaded())
                    $nextButton.appendTo(this._itemContainer());
                if (!value)
                    $nextButton.detach()
            },
            _getNextButton: function() {
                if (!this._$nextButton)
                    this._$nextButton = this._createNextButton();
                return this._$nextButton
            },
            _createNextButton: function() {
                var $result = $("<div>").addClass(LIST_NEXT_BUTTON_CLASS);
                var $button = $("<div>").appendTo($result);
                this._createComponent($button, "dxButton", {
                    text: this.option("nextButtonText"),
                    onClick: $.proxy(this._nextButtonHandler, this)
                });
                return $result
            },
            _moveFocus: function(location) {
                this.callBase.apply(this, arguments);
                this.scrollToItem(this.option("focusedElement"))
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"pageLoadMode":
                        this._toggleNextButton(args.value);
                        this._initScrollView();
                        break;
                    case"showNextButton":
                        this._toggleNextButton(args.value);
                        break;
                    case"dataSource":
                        this.callBase(args);
                        this._initScrollView();
                        break;
                    case"pullingDownText":
                    case"pulledDownText":
                    case"refreshingText":
                    case"pageLoadingText":
                    case"useNative":
                    case"showScrollbar":
                    case"bounceEnabled":
                    case"scrollByContent":
                    case"scrollByThumb":
                    case"scrollingEnabled":
                    case"pullRefreshEnabled":
                    case"autoPagingEnabled":
                        this._initScrollView();
                        break;
                    case"nextButtonText":
                    case"onItemSwipe":
                        this._invalidate();
                        break;
                    case"onScroll":
                    case"onPullRefresh":
                    case"onPageLoading":
                        this._createScrollViewActions();
                        this._invalidate();
                        break;
                    case"grouped":
                    case"collapsibleGroups":
                    case"groupTemplate":
                        this._invalidate();
                        break;
                    case"onGroupRendered":
                        this._createGroupRenderAction();
                        break;
                    case"items":
                        this._invalidate();
                        break;
                    case"width":
                    case"height":
                        this.callBase(args);
                        this._scrollView.update();
                        break;
                    case"indicateLoading":
                        this._hideLoadingIfLoadIndicationOff();
                        break;
                    case"visible":
                        this.callBase(args);
                        this._scrollView.update();
                        break;
                    case"rtlEnabled":
                        this._initScrollView();
                        this.callBase(args);
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _extendActionArgs: function($itemElement) {
                if (!this.option("grouped"))
                    return this.callBase($itemElement);
                var $group = $itemElement.closest("." + LIST_GROUP_CLASS);
                var $item = $group.find("." + LIST_ITEM_CLASS);
                return $.extend(this.callBase($itemElement), {itemIndex: {
                            group: $group.index(),
                            item: $item.index($itemElement)
                        }})
            },
            expandGroup: function(groupIndex) {
                var deferred = $.Deferred(),
                    $group = this._itemContainer().find("." + LIST_GROUP_CLASS).eq(groupIndex);
                this._collapseGroupHandler($group, false).done($.proxy(function() {
                    deferred.resolveWith(this)
                }, this));
                return deferred.promise()
            },
            collapseGroup: function(groupIndex) {
                var deferred = $.Deferred(),
                    $group = this._itemContainer().find("." + LIST_GROUP_CLASS).eq(groupIndex);
                this._collapseGroupHandler($group, true).done($.proxy(function() {
                    deferred.resolveWith(this)
                }, this));
                return deferred
            },
            updateDimensions: function() {
                var that = this,
                    deferred = $.Deferred();
                if (that._scrollView)
                    that._scrollView.update().done(function() {
                        deferred.resolveWith(that)
                    });
                else
                    deferred.resolveWith(that);
                return deferred.promise()
            },
            reload: function() {
                this.scrollTo(0);
                this._pullDownHandler()
            },
            scrollTop: function() {
                return this._scrollView.scrollOffset().top
            },
            clientHeight: function() {
                return this._scrollView.clientHeight()
            },
            scrollHeight: function() {
                return this._scrollView.scrollHeight()
            },
            scrollBy: function(distance) {
                this._scrollView.scrollBy(distance)
            },
            scrollTo: function(location) {
                this._scrollView.scrollTo(location)
            },
            scrollToItem: function(itemElement) {
                var $item = this._editStrategy.getItemElement(itemElement);
                this._scrollView.scrollToElement($item)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            removeDublicates = utils.removeDublicates;
        var LIST_ITEM_SELECTED_CLASS = "dx-list-item-selected",
            LIST_ITEM_RESPONSE_WAIT_CLASS = "dx-list-item-response-wait",
            STATIC_DELETE_BUTTON_CONTAINER_CLASS = "dx-list-static-delete-button-container",
            STATIC_DELETE_BUTTON_CLASS = "dx-list-static-delete-button";
        DX.registerComponent("dxList", ui, ui.dxList.inherit({
            _supportedKeys: function() {
                var that = this,
                    parent = this.callBase();
                var deleteFocusedItem = function(e) {
                        if (that.option("allowItemDeleting")) {
                            e.preventDefault();
                            that.deleteItem(that.option("focusedElement"))
                        }
                    };
                var moveFocusedItemUp = function(e) {
                        if (e.shiftKey && that.option("allowItemReordering")) {
                            e.preventDefault();
                            var focusedItemIndex = that._editStrategy.getNormalizedIndex(that.option("focusedElement")),
                                $prevItem = that._editStrategy.getItemElement(focusedItemIndex - 1);
                            that.reorderItem(that.option("focusedElement"), $prevItem);
                            that.scrollToItem(that.option("focusedElement"))
                        }
                        else
                            parent.upArrow(e)
                    };
                var moveFocusedItemDown = function(e) {
                        if (e.shiftKey && that.option("allowItemReordering")) {
                            e.preventDefault();
                            var focusedItemIndex = that._editStrategy.getNormalizedIndex(that.option("focusedElement")),
                                $nextItem = that._editStrategy.getItemElement(focusedItemIndex + 1);
                            that.reorderItem(that.option("focusedElement"), $nextItem);
                            that.scrollToItem(that.option("focusedElement"))
                        }
                        else
                            parent.downArrow(e)
                    };
                return $.extend({}, parent, {
                        del: deleteFocusedItem,
                        upArrow: moveFocusedItemUp,
                        downArrow: moveFocusedItemDown
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    itemDeleteAction: {
                        since: "14.2",
                        alias: "onItemDeleted"
                    },
                    itemReorderAction: {
                        since: "14.2",
                        alias: "onItemReordered"
                    },
                    itemUnselectAction: {
                        since: "14.2",
                        message: "Use the 'onSelectionChanged' option instead"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    showSelectionControls: false,
                    selectionMode: 'none',
                    selectAllText: Globalize.localize("dxList-selectAll"),
                    menuItems: [],
                    menuMode: "context",
                    allowItemDeleting: false,
                    itemDeleteMode: "toggle",
                    allowItemReordering: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return device.platform === "ios"
                            },
                            options: {
                                menuMode: "slide",
                                itemDeleteMode: "slideItem"
                            }
                        }, {
                            device: {platform: "android"},
                            options: {itemDeleteMode: "swipe"}
                        }, {
                            device: {platform: "win8"},
                            options: {itemDeleteMode: "context"}
                        }, {
                            device: {platform: "generic"},
                            options: {itemDeleteMode: "static"}
                        }])
            },
            _init: function() {
                this.callBase();
                this._initEditProvider()
            },
            _initEditProvider: function() {
                this._editProvider = new ui.dxList.EditProvider(this)
            },
            _disposeEditProvider: function() {
                if (this._editProvider)
                    this._editProvider.dispose()
            },
            _refreshEditProvider: function() {
                this._disposeEditProvider();
                this._initEditProvider()
            },
            _initEditStrategy: function(grouped) {
                if (this.option("grouped"))
                    this._editStrategy = new ui.dxList.GroupedEditStrategy(this);
                else
                    this.callBase()
            },
            _render: function() {
                this._refreshEditProvider();
                this.callBase()
            },
            _renderItems: function() {
                this.callBase.apply(this, arguments);
                this._editProvider.afterItemsRendered()
            },
            _selectedItemClass: function() {
                return LIST_ITEM_SELECTED_CLASS
            },
            _itemResponseWaitClass: function() {
                return LIST_ITEM_RESPONSE_WAIT_CLASS
            },
            _itemClickHandler: function(e) {
                var $itemElement = $(e.currentTarget);
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                var handledByEditProvider = this._editProvider.handleClick($itemElement, e);
                if (handledByEditProvider)
                    return;
                this.callBase.apply(this, arguments)
            },
            _shouldAttachContextMenuEvent: function() {
                return this.callBase.apply(this, arguments) || this._editProvider.contextMenuHandlerExists()
            },
            _itemHoldHandler: function(e) {
                var $itemElement = $(e.currentTarget);
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                var isTouchEvent = ui.events.isTouchEvent(e),
                    handledByEditProvider = isTouchEvent && this._editProvider.handleContextMenu($itemElement, e);
                if (handledByEditProvider) {
                    e.handledByEditProvider = true;
                    return
                }
                this.callBase.apply(this, arguments)
            },
            _itemContextMenuHandler: function(e) {
                var $itemElement = $(e.currentTarget);
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                var handledByEditProvider = !e.handledByEditProvider && this._editProvider.handleContextMenu($itemElement, e);
                if (handledByEditProvider)
                    return;
                this.callBase.apply(this, arguments)
            },
            _postprocessRenderItem: function(args) {
                this.callBase.apply(this, arguments);
                this._editProvider.modifyItemElement(args)
            },
            _clean: function() {
                this._disposeEditProvider();
                this.callBase()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"items":
                        this._clearSelectedItems();
                        this.callBase(args);
                        break;
                    case"grouped":
                        this._clearSelectedItems();
                        delete this._renderingGroupIndex;
                        this._initEditStrategy(args.value);
                        this.callBase(args);
                        break;
                    case"showSelectionControls":
                    case"menuItems":
                    case"menuMode":
                    case"allowItemDeleting":
                    case"itemDeleteMode":
                    case"allowItemReordering":
                    case"selectAllText":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            getFlatIndexByItemElement: function(itemElement) {
                return this._itemElements().index(itemElement)
            },
            getItemElementByFlatIndex: function(flatIndex) {
                var $itemElements = this._itemElements();
                if (flatIndex < 0 || flatIndex >= $itemElements.length)
                    return $();
                return $itemElements.eq(flatIndex)
            },
            getItemByIndex: function(index) {
                return this._getItemData(this._itemElements().eq(index))
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.strategy.grouped.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LIST_ITEM_CLASS = "dx-list-item",
            LIST_GROUP_CLASS = "dx-list-group";
        var SELECTION_SHIFT = 20,
            SELECTION_MASK = 0x8FF;
        var combineIndex = function(indices) {
                return (indices.group << SELECTION_SHIFT) + indices.item
            };
        var splitIndex = function(combinedIndex) {
                return {
                        group: combinedIndex >> SELECTION_SHIFT,
                        item: combinedIndex & SELECTION_MASK
                    }
            };
        var createGroupSelection = function(group, selectedItems) {
                var groupItems = group.items,
                    groupSelection = {
                        key: group.key,
                        items: []
                    };
                $.each(selectedItems, function(_, itemIndex) {
                    groupSelection.items.push(groupItems[itemIndex])
                });
                return groupSelection
            };
        var groupByKey = function(groups, key) {
                var length = groups.length;
                for (var i = 0; i < length; i++)
                    if (groups[i].key === key)
                        return groups[i]
            };
        ui.dxList.GroupedEditStrategy = ui.CollectionWidget.EditStrategy.inherit({
            _groupElements: function() {
                return this._collectionWidget._itemContainer().find("." + LIST_GROUP_CLASS)
            },
            _groupItemElements: function($group) {
                return $group.find("." + LIST_ITEM_CLASS)
            },
            getIndexByItemData: function(itemData) {
                return null
            },
            getItemDataByIndex: function(index) {
                return null
            },
            deleteItemAtIndex: function(index) {
                var indices = splitIndex(index),
                    itemGroup = this._collectionWidget.option("items")[indices.group].items;
                itemGroup.splice(indices.item, 1)
            },
            updateSelectionAfterDelete: function(fromIndex) {
                var deletedIndices = splitIndex(fromIndex),
                    selectedItemIndices = this._collectionWidget._selectedItemIndices;
                $.each(selectedItemIndices, function(i, index) {
                    var indices = splitIndex(index);
                    if (indices.group === deletedIndices.group && indices.item > deletedIndices.item)
                        selectedItemIndices[i] -= 1
                })
            },
            fetchSelectedItems: function(indices) {
                indices = indices || this._collectionWidget._selectedItemIndices;
                var items = this._collectionWidget.option("items"),
                    selectedItems = [];
                indices.sort(function(a, b) {
                    return a - b
                });
                var currentGroupIndex = 0,
                    groupSelectedIndices = [];
                $.each(indices, function(_, combinedIndex) {
                    var index = splitIndex(combinedIndex);
                    if (index.group !== currentGroupIndex && groupSelectedIndices.length) {
                        selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                        groupSelectedIndices.length = 0
                    }
                    currentGroupIndex = index.group;
                    groupSelectedIndices.push(index.item)
                });
                if (groupSelectedIndices.length)
                    selectedItems.push(createGroupSelection(items[currentGroupIndex], groupSelectedIndices));
                return selectedItems
            },
            selectedItemIndices: function() {
                var selectedIndices = [],
                    items = this._collectionWidget.option("items"),
                    selected = this._collectionWidget.option("selectedItems");
                $.each(selected, function(_, selectionInGroup) {
                    var group = groupByKey(items, selectionInGroup.key),
                        groupIndex = $.inArray(group, items);
                    if (!group) {
                        DX.log("W1003", selectionInGroup.key);
                        return
                    }
                    $.each(selectionInGroup.items, function(_, selectedGroupItem) {
                        var itemIndex = $.inArray(selectedGroupItem, group.items);
                        if (itemIndex !== -1)
                            selectedIndices.push(combineIndex({
                                group: groupIndex,
                                item: itemIndex
                            }));
                        else
                            DX.log("W1004", selectedGroupItem, selectionInGroup.key)
                    })
                });
                return selectedIndices
            },
            moveItemAtIndexToIndex: function(movingIndex, destinationIndex) {
                var items = this._collectionWidget.option("items"),
                    movingIndices = splitIndex(movingIndex),
                    destinationIndices = splitIndex(destinationIndex),
                    movingItemGroup = items[movingIndices.group].items,
                    destinationItemGroup = items[destinationIndices.group].items,
                    movedItemData = movingItemGroup[movingIndices.item];
                movingItemGroup.splice(movingIndices.item, 1);
                destinationItemGroup.splice(destinationIndices.item, 0, movedItemData)
            },
            getSelectedItemsAfterReorderItem: function(movingIndex, destinationIndex) {
                if (this._itemsFromSameParent(movingIndex, destinationIndex) || $.inArray(movingIndex, this._collectionWidget._selectedItemIndices))
                    return this.callBase();
                var items = this._collectionWidget.option("items"),
                    selectedItems = this._collectionWidget.option("selectedItems"),
                    movingIndices = splitIndex(movingIndex),
                    destinationIndices = splitIndex(destinationIndex),
                    movingSelectedItemGroup = selectedItems[movingIndices.group].items,
                    destinationSelectedItemGroup = selectedItems[destinationIndices.group].items,
                    movedItemData = items[movingIndices.group].items[movingIndices.item],
                    movedItemSelectedIndex = $.inArray(movedItemData, movingSelectedItemGroup);
                movingSelectedItemGroup.splice(movedItemSelectedIndex, 1);
                destinationSelectedItemGroup.push(movedItemData);
                return selectedItems
            },
            _isItemIndex: function(index) {
                return $.isNumeric(index.group) && $.isNumeric(index.item)
            },
            _getNormalizedItemIndex: function(itemElement) {
                var $item = $(itemElement),
                    $group = $item.closest("." + LIST_GROUP_CLASS);
                return combineIndex({
                        group: this._groupElements().index($group),
                        item: this._groupItemElements($group).index($item)
                    })
            },
            _normalizeItemIndex: function(index) {
                return combineIndex(index)
            },
            _denormalizeItemIndex: function(index) {
                return splitIndex(index)
            },
            _getItemByNormalizedIndex: function(index) {
                var indices = splitIndex(index),
                    $group = this._groupElements().eq(indices.group);
                return this._groupItemElements($group).eq(indices.item)
            },
            _itemsFromSameParent: function(firstIndex, secondIndex) {
                return splitIndex(firstIndex).group === splitIndex(secondIndex).group
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        ui.dxList.EditDecoratorsRegistry = {};
        ui.dxList.registerEditDecorator = function(option, type, decoratorClass) {
            var decoratorsRegistry = ui.dxList.EditDecoratorsRegistry;
            var decoratorConfig = {};
            decoratorConfig[option] = decoratorsRegistry[option] ? decoratorsRegistry[option] : {};
            decoratorConfig[option][type] = decoratorClass;
            decoratorsRegistry = $.extend(decoratorsRegistry, decoratorConfig)
        };
        var LIST_EDIT_DECORATOR = "dxListEditDecorator",
            SWIPE_START_EVENT_NAME = events.addNamespace("dxswipestart", LIST_EDIT_DECORATOR),
            SWIPE_UPDATE_EVENT_NAME = events.addNamespace("dxswipe", LIST_EDIT_DECORATOR),
            SWIPE_END_EVENT_NAME = events.addNamespace("dxswipeend", LIST_EDIT_DECORATOR);
        ui.dxList.EditDecorator = DX.Class.inherit({
            ctor: function(list) {
                this._list = list;
                this._init()
            },
            _init: $.noop,
            _shouldHandleSwipe: false,
            _attachSwipeEvent: function(config) {
                var swipeConfig = {itemSizeFunc: $.proxy(function() {
                            if (this._clearSwipeCache) {
                                this._itemWidthCache = this._list.element().width();
                                this._clearSwipeCache = false
                            }
                            return this._itemWidthCache
                        }, this)};
                config.$itemElement.on(SWIPE_START_EVENT_NAME, swipeConfig, $.proxy(this._itemSwipeStartHandler, this)).on(SWIPE_UPDATE_EVENT_NAME, $.proxy(this._itemSwipeUpdateHandler, this)).on(SWIPE_END_EVENT_NAME, $.proxy(this._itemSwipeEndHandler, this))
            },
            _itemSwipeStartHandler: function(e) {
                var $itemElement = $(e.currentTarget);
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
                    e.cancel = true;
                    return
                }
                this._swipeStartHandler($itemElement, e)
            },
            _itemSwipeUpdateHandler: function(e) {
                var $itemElement = $(e.currentTarget);
                this._swipeUpdateHandler($itemElement, e)
            },
            _itemSwipeEndHandler: function(e) {
                var $itemElement = $(e.currentTarget);
                this._swipeEndHandler($itemElement, e);
                this._clearSwipeCache = true
            },
            beforeBag: $.noop,
            afterBag: $.noop,
            _commonOptions: function() {
                return {
                        activeStateEnabled: this._list.option("activeStateEnabled"),
                        hoverStateEnabled: this._list.option("hoverStateEnabled"),
                        focusStateEnabled: this._list.option("focusStateEnabled")
                    }
            },
            modifyElement: function(config) {
                if (this._shouldHandleSwipe) {
                    this._attachSwipeEvent(config);
                    this._clearSwipeCache = true
                }
            },
            afterRender: $.noop,
            handleClick: $.noop,
            handleContextMenu: $.noop,
            _swipeStartHandler: $.noop,
            _swipeUpdateHandler: $.noop,
            _swipeEndHandler: $.noop,
            visibilityChange: $.noop,
            dispose: $.noop
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decoratorMenuHelper.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        ui.dxList.EditDecoratorMenuHelperMixin = {
            _menuEnabled: function() {
                return !!this._menuItems().length
            },
            _menuItems: function() {
                return this._list.option("menuItems")
            },
            _deleteEnabled: function() {
                return this._list.option("allowItemDeleting")
            },
            _fireMenuAction: function($itemElement, action) {
                this._list._itemEventHandlerByHandler($itemElement, action, {}, {excludeValidators: ["disabled", "readOnly"]})
            }
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.static.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var STATIC_DELETE_BUTTON_CONTAINER_CLASS = "dx-list-static-delete-button-container",
            STATIC_DELETE_BUTTON_CLASS = "dx-list-static-delete-button",
            STATIC_DELETE_BUTTON_MARGIN = 5;
        ui.dxList.registerEditDecorator("delete", "static", ui.dxList.EditDecorator.inherit({
            afterBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $button = $("<div>").addClass(STATIC_DELETE_BUTTON_CLASS);
                this._list._createComponent($button, "dxButton", {
                    icon: "remove",
                    type: "danger",
                    onClick: $.proxy(function(e) {
                        this._deleteItem($itemElement)
                    }, this)
                });
                $container.addClass(STATIC_DELETE_BUTTON_CONTAINER_CLASS).append($button)
            },
            _deleteItem: function($itemElement) {
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                this._list.deleteItem($itemElement)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.switchable.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var LIST_EDIT_DECORATOR = "dxListEditDecorator",
            POINTER_DOWN_EVENT_NAME = events.addNamespace("dxpointerdown", LIST_EDIT_DECORATOR),
            LIST_ITEM_CONTENT_CLASS = "dx-list-item-content",
            SWITCHABLE_DELETE_READY_CLASS = "dx-list-switchable-delete-ready",
            SWITCHABLE_MENU_SHIELD_POSITIONING_CLASS = "dx-list-switchable-menu-shield-positioning",
            SWITCHABLE_DELETE_TOP_SHIELD_CLASS = "dx-list-switchable-delete-top-shield",
            SWITCHABLE_DELETE_BOTTOM_SHIELD_CLASS = "dx-list-switchable-delete-bottom-shield",
            SWITCHABLE_MENU_ITEM_SHIELD_POSITIONING_CLASS = "dx-list-switchable-menu-item-shield-positioning",
            SWITCHABLE_DELETE_ITEM_CONTENT_SHIELD_CLASS = "dx-list-switchable-delete-item-content-shield";
        ui.dxList.SwitchableEditDecorator = ui.dxList.EditDecorator.inherit({
            _init: function() {
                this._$topShield = $("<div />").addClass(SWITCHABLE_DELETE_TOP_SHIELD_CLASS);
                this._$bottomShield = $("<div />").addClass(SWITCHABLE_DELETE_BOTTOM_SHIELD_CLASS);
                this._$itemContentShield = $("<div />").addClass(SWITCHABLE_DELETE_ITEM_CONTENT_SHIELD_CLASS);
                this._$topShield.on(POINTER_DOWN_EVENT_NAME, $.proxy(this._cancelDeleteReadyItem, this));
                this._$bottomShield.on(POINTER_DOWN_EVENT_NAME, $.proxy(this._cancelDeleteReadyItem, this));
                this._list.element().append(this._$topShield.toggle(false)).append(this._$bottomShield.toggle(false))
            },
            handleClick: function($itemElement) {
                return this._cancelDeleteReadyItem()
            },
            _cancelDeleteReadyItem: function() {
                if (!this._$readyToDeleteItem)
                    return false;
                this._cancelDelete(this._$readyToDeleteItem);
                return true
            },
            _cancelDelete: function($itemElement) {
                this._toggleDeleteReady($itemElement, false)
            },
            _toggleDeleteReady: function($itemElement, readyToDelete) {
                if (readyToDelete === undefined)
                    readyToDelete = !this._isReadyToDelete($itemElement);
                this._toggleShields($itemElement, readyToDelete);
                this._toggleScrolling(readyToDelete);
                this._cacheReadyToDeleteItem($itemElement, readyToDelete);
                this._animateToggleDelete($itemElement, readyToDelete)
            },
            _isReadyToDelete: function($itemElement) {
                return $itemElement.hasClass(SWITCHABLE_DELETE_READY_CLASS)
            },
            _toggleShields: function($itemElement, enabled) {
                this._list.element().toggleClass(SWITCHABLE_MENU_SHIELD_POSITIONING_CLASS);
                this._$topShield.toggle(enabled);
                this._$bottomShield.toggle(enabled);
                if (enabled)
                    this._updateShieldsHeight($itemElement);
                this._toggleContentShield($itemElement, enabled)
            },
            _updateShieldsHeight: function($itemElement) {
                var $list = this._list.element(),
                    listTopOffset = $list.offset().top,
                    listHeight = $list.outerHeight(),
                    itemTopOffset = $itemElement.offset().top,
                    itemHeight = $itemElement.outerHeight(),
                    dirtyTopShieldHeight = itemTopOffset - listTopOffset,
                    dirtyBottomShieldHeight = listHeight - itemHeight - dirtyTopShieldHeight;
                this._$topShield.height(Math.max(dirtyTopShieldHeight, 0));
                this._$bottomShield.height(Math.max(dirtyBottomShieldHeight, 0))
            },
            _toggleContentShield: function($itemElement, enabled) {
                if (enabled)
                    $itemElement.find("." + LIST_ITEM_CONTENT_CLASS).append(this._$itemContentShield);
                else
                    this._$itemContentShield.detach()
            },
            _toggleScrolling: function(readyToDelete) {
                var scrollView = this._list.element().dxScrollView("instance");
                if (readyToDelete) {
                    this._scrollViewDisabled = scrollView.option("disabled");
                    scrollView.option("disabled", true)
                }
                else
                    scrollView.option("disabled", this._scrollViewDisabled)
            },
            _cacheReadyToDeleteItem: function($itemElement, cache) {
                if (cache)
                    this._$readyToDeleteItem = $itemElement;
                else
                    delete this._$readyToDeleteItem
            },
            _animateToggleDelete: function($itemElement, readyToDelete) {
                if (readyToDelete) {
                    this._enablePositioning($itemElement);
                    this._prepareDeleteReady($itemElement);
                    this._animatePrepareDeleteReady($itemElement)
                }
                else {
                    this._forgetDeleteReady($itemElement);
                    this._animateForgetDeleteReady($itemElement).done($.proxy(this._disablePositioning, this, $itemElement))
                }
            },
            _enablePositioning: function($itemElement) {
                $itemElement.addClass(SWITCHABLE_MENU_ITEM_SHIELD_POSITIONING_CLASS)
            },
            _disablePositioning: function($itemElement) {
                $itemElement.removeClass(SWITCHABLE_MENU_ITEM_SHIELD_POSITIONING_CLASS)
            },
            _prepareDeleteReady: function($itemElement) {
                $itemElement.addClass(SWITCHABLE_DELETE_READY_CLASS)
            },
            _forgetDeleteReady: function($itemElement) {
                $itemElement.removeClass(SWITCHABLE_DELETE_READY_CLASS)
            },
            _animatePrepareDeleteReady: DX.abstract,
            _animateForgetDeleteReady: DX.abstract,
            _deleteItem: function($itemElement) {
                $itemElement = $itemElement || this._$readyToDeleteItem;
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *"))
                    return;
                this._list.deleteItem($itemElement).always($.proxy(this._cancelDelete, this, $itemElement))
            },
            _isRtlEnabled: function() {
                return this._list.option("rtlEnabled")
            },
            dispose: function() {
                if (this._$topShield)
                    this._$topShield.remove();
                if (this._$bottomShield)
                    this._$bottomShield.remove();
                this.callBase.apply(this, arguments)
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.switchable.button.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx;
        var SWITCHABLE_DELETE_BUTTON_CONTAINER_CLASS = "dx-list-switchable-delete-button-container",
            SWITCHABLE_DELETE_BUTTON_WRAPPER_CLASS = "dx-list-switchable-delete-button-wrapper",
            SWITCHABLE_DELETE_BUTTON_INNER_WRAPPER_CLASS = "dx-list-switchable-delete-button-inner-wrapper",
            SWITCHABLE_DELETE_BUTTON_CLASS = "dx-list-switchable-delete-button",
            SWITCHABLE_DELETE_MENU_CLASS = "dx-list-switchable-delete-menu",
            SWITCHABLE_DELETE_BUTTON_ANIMATION_DURATION = 200;
        ui.dxList.SwitchableButtonEditDecorator = ui.dxList.SwitchableEditDecorator.inherit({
            _init: function() {
                this.callBase.apply(this, arguments);
                var $buttonContainer = $("<div >").addClass(SWITCHABLE_DELETE_BUTTON_CONTAINER_CLASS),
                    $buttonWrapper = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_WRAPPER_CLASS),
                    $buttonInnerWrapper = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_INNER_WRAPPER_CLASS),
                    $button = $("<div />").addClass(SWITCHABLE_DELETE_BUTTON_CLASS);
                this._list._createComponent($button, "dxButton", {
                    text: Globalize.localize("dxListEditDecorator-delete"),
                    type: "danger",
                    onClick: $.proxy(function(e) {
                        this._deleteItem();
                        e.jQueryEvent.stopPropagation()
                    }, this)
                });
                $buttonContainer.append($buttonWrapper);
                $buttonWrapper.append($buttonInnerWrapper);
                $buttonInnerWrapper.append($button);
                this._$buttonContainer = $buttonContainer
            },
            _enablePositioning: function($itemElement) {
                this.callBase.apply(this, arguments);
                fx.stop(this._$buttonContainer, true);
                this._$buttonContainer.appendTo($itemElement)
            },
            _disablePositioning: function() {
                this.callBase.apply(this, arguments);
                this._$buttonContainer.detach()
            },
            _animatePrepareDeleteReady: function() {
                var rtl = this._isRtlEnabled(),
                    listWidth = this._list.element().width(),
                    buttonWidth = this._buttonWidth(),
                    fromValue = rtl ? listWidth : -buttonWidth,
                    toValue = rtl ? listWidth - buttonWidth : 0;
                return fx.animate(this._$buttonContainer, {
                        type: "custom",
                        duration: SWITCHABLE_DELETE_BUTTON_ANIMATION_DURATION,
                        from: {right: fromValue},
                        to: {right: toValue}
                    })
            },
            _animateForgetDeleteReady: function() {
                var rtl = this._isRtlEnabled(),
                    listWidth = this._list.element().width(),
                    buttonWidth = this._buttonWidth(),
                    fromValue = rtl ? listWidth - buttonWidth : 0,
                    toValue = rtl ? listWidth : -buttonWidth;
                return fx.animate(this._$buttonContainer, {
                        type: "custom",
                        duration: SWITCHABLE_DELETE_BUTTON_ANIMATION_DURATION,
                        from: {right: fromValue},
                        to: {right: toValue}
                    })
            },
            _buttonWidth: function() {
                if (!this._buttonContainerWidth)
                    this._buttonContainerWidth = this._$buttonContainer.outerWidth();
                return this._buttonContainerWidth
            },
            dispose: function() {
                if (this._$buttonContainer)
                    this._$buttonContainer.remove();
                this.callBase.apply(this, arguments)
            }
        });
        var TOGGLE_DELETE_SWITCH_CONTAINER_CLASS = "dx-list-toggle-delete-switch-container",
            TOGGLE_DELETE_SWITCH_CLASS = "dx-list-toggle-delete-switch";
        ui.dxList.registerEditDecorator("delete", "toggle", ui.dxList.SwitchableButtonEditDecorator.inherit({beforeBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $toggle = $("<div />").addClass(TOGGLE_DELETE_SWITCH_CLASS);
                this._list._createComponent($toggle, "dxButton", {
                    icon: "toggle-delete",
                    onClick: $.proxy(function(e) {
                        this._toggleDeleteReady($itemElement);
                        e.jQueryEvent.stopPropagation()
                    }, this)
                });
                $container.addClass(TOGGLE_DELETE_SWITCH_CONTAINER_CLASS);
                $container.append($toggle)
            }}));
        ui.dxList.registerEditDecorator("delete", "slideButton", ui.dxList.SwitchableButtonEditDecorator.inherit({
            _shouldHandleSwipe: true,
            _swipeEndHandler: function($itemElement, args) {
                if (args.targetOffset !== 0)
                    this._toggleDeleteReady($itemElement);
                return true
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.switchable.slide.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator,
            fx = DX.fx;
        var LIST_EDIT_DECORATOR = "dxListEditDecorator",
            CLICK_EVENT_NAME = events.addNamespace("dxclick", LIST_EDIT_DECORATOR),
            SLIDE_MENU_CLASS = "dx-list-slide-menu",
            SLIDE_MENU_WRAPPER_CLASS = "dx-list-slide-menu-wrapper",
            SLIDE_MENU_CONTENT_CLASS = "dx-list-slide-menu-content",
            SLIDE_MENU_BUTTONS_CONTAINER_CLASS = "dx-list-slide-menu-buttons-container",
            SLIDE_MENU_BUTTONS_CLASS = "dx-list-slide-menu-buttons",
            SLIDE_MENU_BUTTON_CLASS = "dx-list-slide-menu-button",
            SLIDE_MENU_BUTTON_MENU_CLASS = "dx-list-slide-menu-button-menu",
            SLIDE_MENU_BUTTON_DELETE_CLASS = "dx-list-slide-menu-button-delete";
        ui.dxList.registerEditDecorator("menu", "slide", ui.dxList.SwitchableEditDecorator.inherit({
            _shouldHandleSwipe: true,
            _init: function() {
                this.callBase.apply(this, arguments);
                this._$buttonsContainer = $("<div/>").addClass(SLIDE_MENU_BUTTONS_CONTAINER_CLASS);
                this._$buttons = $("<div/>").addClass(SLIDE_MENU_BUTTONS_CLASS).appendTo(this._$buttonsContainer);
                this._renderMenu();
                this._renderDeleteButton()
            },
            _renderMenu: function() {
                if (!this._menuEnabled())
                    return;
                var menuItems = this._menuItems();
                if (menuItems.length === 1) {
                    var menuItem = menuItems[0];
                    this._renderMenuButton(menuItem.text, $.proxy(function() {
                        this._fireAction(menuItem)
                    }, this))
                }
                else {
                    var $menu = $("<div />").addClass(SLIDE_MENU_CLASS);
                    this._menu = this._list._createComponent($menu, "dxActionSheet", {
                        showTitle: false,
                        items: menuItems,
                        onItemClick: $.proxy(function(args) {
                            this._fireAction(args.itemData)
                        }, this),
                        _templates: {}
                    });
                    $menu.appendTo(this._list.element());
                    var $menuButton = this._renderMenuButton(Globalize.localize("dxListEditDecorator-more"), $.proxy(this._menu.show, this._menu));
                    this._menu.option("target", $menuButton)
                }
            },
            _renderMenuButton: function(text, action) {
                var $menuButton = $("<div/>").addClass(SLIDE_MENU_BUTTON_CLASS).addClass(SLIDE_MENU_BUTTON_MENU_CLASS).text(text);
                this._$buttons.append($menuButton);
                $menuButton.on(CLICK_EVENT_NAME, action);
                return $menuButton
            },
            _renderDeleteButton: function() {
                if (!this._deleteEnabled())
                    return;
                var $deleteButton = $("<div/>").addClass(SLIDE_MENU_BUTTON_CLASS).addClass(SLIDE_MENU_BUTTON_DELETE_CLASS).text(Globalize.localize("dxListEditDecorator-delete"));
                $deleteButton.on(CLICK_EVENT_NAME, $.proxy(function() {
                    this._deleteItem()
                }, this));
                this._$buttons.append($deleteButton)
            },
            _fireAction: function(menuItem) {
                this._fireMenuAction($(this._cachedNode), menuItem.action);
                this._cancelDeleteReadyItem()
            },
            modifyElement: function(config) {
                this.callBase.apply(this, arguments);
                var $itemElement = config.$itemElement;
                $itemElement.addClass(SLIDE_MENU_WRAPPER_CLASS);
                var $slideMenuContent = $("<div/>").addClass(SLIDE_MENU_CONTENT_CLASS);
                $itemElement.wrapInner($slideMenuContent)
            },
            handleClick: function(_, e) {
                if ($(e.target).closest("." + SLIDE_MENU_CONTENT_CLASS).length)
                    return this.callBase.apply(this, arguments);
                return false
            },
            _swipeStartHandler: function($itemElement) {
                this._enablePositioning($itemElement);
                this._cacheItemData($itemElement)
            },
            _swipeUpdateHandler: function($itemElement, args) {
                var rtl = this._isRtlEnabled(),
                    signCorrection = rtl ? -1 : 1,
                    offset = this._cachedItemWidth * args.offset,
                    startOffset = this._isReadyToDelete($itemElement) ? -this._cachedButtonWidth * signCorrection : 0,
                    correctedOffset = (offset + startOffset) * signCorrection,
                    contentPosition = correctedOffset < 0 ? offset + startOffset : 0,
                    buttonPosition = correctedOffset < 0 ? correctedOffset : 0;
                translator.move(this._$cachedContent, {left: contentPosition});
                this._$buttonsContainer.css(rtl ? "right" : "left", Math.max(this._cachedItemWidth + buttonPosition, this._minButtonContainerLeftOffset()));
                return true
            },
            _cacheItemData: function($itemElement) {
                if ($itemElement[0] === this._cachedNode)
                    return;
                this._$cachedContent = $itemElement.find("." + SLIDE_MENU_CONTENT_CLASS);
                this._cachedItemWidth = $itemElement.outerWidth();
                this._cachedButtonWidth = this._cachedButtonWidth || $itemElement.find("." + SLIDE_MENU_BUTTONS_CLASS).outerWidth();
                if (this._$cachedContent.length)
                    this._cachedNode = $itemElement[0]
            },
            _minButtonContainerLeftOffset: function() {
                return this._cachedItemWidth - this._cachedButtonWidth
            },
            _swipeEndHandler: function($itemElement, args) {
                this._cacheItemData($itemElement);
                var signCorrection = this._isRtlEnabled() ? 1 : -1,
                    offset = this._cachedItemWidth * args.offset,
                    endedAtReadyToDelete = !this._isReadyToDelete($itemElement) && offset * signCorrection > this._cachedButtonWidth * .2,
                    readyToDelete = args.targetOffset === signCorrection || endedAtReadyToDelete;
                this._toggleDeleteReady($itemElement, readyToDelete);
                return true
            },
            _enablePositioning: function($itemElement) {
                this.callBase.apply(this, arguments);
                this._$buttonsContainer.appendTo($itemElement)
            },
            _disablePositioning: function($itemElement) {
                this.callBase.apply(this, arguments);
                this._$buttonsContainer.detach()
            },
            _animatePrepareDeleteReady: function() {
                var rtl = this._isRtlEnabled(),
                    directionCorrection = rtl ? 1 : -1;
                this._$buttonsContainer.css(rtl ? "left" : "right", "0");
                var contentAnimation = fx.animate(this._$cachedContent, {
                        to: {left: this._cachedButtonWidth * directionCorrection},
                        type: "slide",
                        duration: 200
                    });
                var direction = rtl ? "right" : "left",
                    buttonToAnimation = {};
                buttonToAnimation[direction] = this._minButtonContainerLeftOffset();
                var buttonAnimation = fx.animate(this._$buttonsContainer, {
                        to: buttonToAnimation,
                        duration: 200
                    });
                return $.when(contentAnimation, buttonAnimation).promise()
            },
            _animateForgetDeleteReady: function($itemElement) {
                this._cacheItemData($itemElement);
                var rtl = this._isRtlEnabled();
                this._$buttonsContainer.css(rtl ? "left" : "right", "0");
                var contentAnimation = fx.animate(this._$cachedContent, {
                        to: {left: 0},
                        type: "slide",
                        duration: 200
                    });
                var direction = rtl ? "right" : "left",
                    buttonToAnimation = {};
                buttonToAnimation[direction] = this._cachedItemWidth;
                var buttonAnimation = fx.animate(this._$buttonsContainer, {
                        to: buttonToAnimation,
                        duration: 200,
                        complete: $.proxy(function() {
                            this._$buttonsContainer.css(direction, "100%")
                        }, this)
                    });
                return $.when(contentAnimation, buttonAnimation).promise()
            },
            dispose: function() {
                if (this._menu)
                    this._menu.element().remove();
                if (this._$buttonsContainer)
                    this._$buttonsContainer.remove();
                this.callBase.apply(this, arguments)
            }
        }).include(ui.dxList.EditDecoratorMenuHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.swipe.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            translator = DX.translator,
            fx = DX.fx;
        ui.dxList.registerEditDecorator("delete", "swipe", ui.dxList.EditDecorator.inherit({
            _shouldHandleSwipe: true,
            _renderItemPosition: function($itemElement, offset, animate) {
                var deferred = $.Deferred(),
                    itemOffset = offset * this._itemElementWidth;
                if (animate)
                    fx.animate($itemElement, {
                        to: {left: itemOffset},
                        type: "slide",
                        complete: function() {
                            deferred.resolve($itemElement, offset)
                        }
                    });
                else {
                    translator.move($itemElement, {left: itemOffset});
                    deferred.resolve()
                }
                return deferred.promise()
            },
            _swipeStartHandler: function($itemElement) {
                this._itemElementWidth = $itemElement.width();
                return true
            },
            _swipeUpdateHandler: function($itemElement, args) {
                this._renderItemPosition($itemElement, args.offset);
                return true
            },
            _swipeEndHandler: function($itemElement, args) {
                var offset = args.targetOffset;
                this._renderItemPosition($itemElement, offset, true).done($.proxy(function($itemElement, offset) {
                    if (Math.abs(offset))
                        this._list.deleteItem($itemElement).fail($.proxy(function() {
                            this._renderItemPosition($itemElement, 0, true)
                        }, this))
                }, this));
                return true
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.context.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var CONTEXTMENU_CLASS = "dx-list-context-menu",
            CONTEXTMENU_MENUCONTENT_CLASS = "dx-list-context-menucontent";
        ui.dxList.registerEditDecorator("menu", "context", ui.dxList.EditDecorator.inherit({
            _init: function() {
                var $menu = $("<div/>").addClass(CONTEXTMENU_CLASS);
                this._list.element().append($menu);
                this._menu = this._renderOverlay($menu)
            },
            _renderOverlay: function($element) {
                return this._list._createComponent($element, "dxOverlay", {
                        shading: false,
                        deferRendering: true,
                        closeOnTargetScroll: true,
                        closeOnOutsideClick: function(e) {
                            return !$(e.target).closest("." + CONTEXTMENU_CLASS).length
                        },
                        animation: {
                            show: {
                                type: "slide",
                                duration: 300,
                                from: {
                                    height: 0,
                                    opacity: 1
                                },
                                to: {
                                    height: $.proxy(function() {
                                        return this._$menuList.outerHeight()
                                    }, this),
                                    opacity: 1
                                }
                            },
                            hide: {
                                type: "slide",
                                duration: 0,
                                from: {opacity: 1},
                                to: {opacity: 0}
                            }
                        },
                        height: $.proxy(function() {
                            return this._$menuList ? this._$menuList.outerHeight() : 0
                        }, this),
                        width: $.proxy(function() {
                            return this._list.element().outerWidth()
                        }, this),
                        onContentReady: $.proxy(this._renderMenuContent, this)
                    })
            },
            _renderMenuContent: function(e) {
                var $overlayContent = e.component.content();
                var items = this._menuItems().slice();
                if (this._deleteEnabled())
                    items.push({
                        text: Globalize.localize("dxListEditDecorator-delete"),
                        action: $.proxy(this._deleteItem, this)
                    });
                this._$menuList = $("<div>");
                this._list._createComponent(this._$menuList, "dxList", {
                    items: items,
                    onItemClick: $.proxy(this._menuItemClickHandler, this),
                    height: "auto",
                    _templates: {}
                });
                $overlayContent.addClass(CONTEXTMENU_MENUCONTENT_CLASS);
                $overlayContent.append(this._$menuList)
            },
            _menuItemClickHandler: function(args) {
                this._menu.hide();
                this._fireMenuAction(this._$itemWithMenu, args.itemData.action)
            },
            _deleteItem: function() {
                this._list.deleteItem(this._$itemWithMenu)
            },
            handleContextMenu: function($itemElement) {
                this._$itemWithMenu = $itemElement;
                this._menu.option({position: {
                        my: "top",
                        at: "bottom",
                        of: $itemElement,
                        collision: "flip"
                    }});
                this._menu.show();
                return true
            },
            dispose: function() {
                if (this._menu)
                    this._menu.element().remove();
                this.callBase.apply(this, arguments)
            }
        }).include(ui.dxList.EditDecoratorMenuHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.selection.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var SELECT_DECORATOR_ENABLED_CLASS = "dx-list-select-decorator-enabled",
            SELECT_DECORATOR_SELECT_ALL_CLASS = "dx-list-select-all",
            SELECT_DECORATOR_SELECT_ALL_CHECKBOX_CLASS = "dx-list-select-all-checkbox",
            SELECT_DECORATOR_SELECT_ALL_LABEL_CLASS = "dx-list-select-all-label",
            SELECT_CHECKBOX_CONTAINER_CLASS = "dx-list-select-checkbox-container",
            SELECT_CHECKBOX_CLASS = "dx-list-select-checkbox",
            SELECT_RADIO_BUTTON_CONTAINER_CLASS = "dx-list-select-radiobutton-container",
            SELECT_RADIO_BUTTON_CLASS = "dx-list-select-radiobutton";
        var CLICK_EVENT_NAME = events.addNamespace("dxclick", "dxListEditDecorator");
        ui.dxList.registerEditDecorator("selection", "default", ui.dxList.EditDecorator.inherit({
            _init: function() {
                this.callBase.apply(this, arguments);
                var selectionMode = this._list.option("selectionMode");
                this._singleStrategy = selectionMode === "single";
                this._containerClass = this._singleStrategy ? SELECT_RADIO_BUTTON_CONTAINER_CLASS : SELECT_CHECKBOX_CONTAINER_CLASS;
                this._controlClass = this._singleStrategy ? SELECT_RADIO_BUTTON_CLASS : SELECT_CHECKBOX_CLASS;
                this._controlWidget = this._singleStrategy ? "dxRadioButton" : "dxCheckBox";
                this._list.element().addClass(SELECT_DECORATOR_ENABLED_CLASS)
            },
            beforeBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $control = $("<div />").addClass(this._controlClass);
                $control[this._controlWidget]($.extend(this._commonOptions(), {
                    value: this._isSelected($itemElement),
                    focusStateEnabled: false,
                    hoverStateEnabled: false,
                    onValueChanged: $.proxy(function(e) {
                        this._processCheckedState($itemElement, e.value);
                        e.jQueryEvent && e.jQueryEvent.stopPropagation()
                    }, this)
                }));
                $container.addClass(this._containerClass);
                $container.append($control)
            },
            modifyElement: function(config) {
                this.callBase.apply(this, arguments);
                var $itemElement = config.$itemElement,
                    control = $itemElement.find("." + this._controlClass)[this._controlWidget]("instance");
                $itemElement.on("stateChanged", $.proxy(function() {
                    control.option("value", this._isSelected($itemElement));
                    this._updateSelectAllState()
                }, this))
            },
            _updateSelectAllState: function() {
                if (!this._$selectAll)
                    return;
                var items = this._list.option("items");
                var selectedItems = this._list.option("selectedItems");
                var isSelectedAll = items.length === selectedItems.length ? true : selectedItems.length === 0 ? false : undefined;
                this._selectAllCheckBox.option("value", isSelectedAll)
            },
            afterRender: function() {
                if (this._list.option("selectionMode") !== "all")
                    return;
                if (!this._$selectAll)
                    this._renderSelectAll();
                if (this._selectAllCheckBox.option("value"))
                    this._selectAllItems()
            },
            _renderSelectAll: function() {
                var $selectAll = this._$selectAll = $("<div>").addClass(SELECT_DECORATOR_SELECT_ALL_CLASS);
                this._selectAllCheckBox = this._list._createComponent($("<div>").addClass(SELECT_DECORATOR_SELECT_ALL_CHECKBOX_CLASS).appendTo($selectAll), "dxCheckBox");
                var $label = $("<div>").addClass(SELECT_DECORATOR_SELECT_ALL_LABEL_CLASS).text(this._list.option("selectAllText")).appendTo($selectAll);
                this._list.itemsContainer().prepend($selectAll);
                this._updateSelectAllState();
                this._attachSelectAllHandler()
            },
            _attachSelectAllHandler: function() {
                this._selectAllCheckBox.option("onValueChanged", $.proxy(this._selectAllHandler, this));
                this._$selectAll.off(CLICK_EVENT_NAME).on(CLICK_EVENT_NAME, $.proxy(this._selectAllClickHandler, this))
            },
            _selectAllHandler: function(e) {
                var isSelectedAll = this._selectAllCheckBox.option("value");
                if (isSelectedAll === true)
                    this._selectAllItems();
                else if (isSelectedAll === false)
                    this._unselectAllItems();
                e.jQueryEvent && e.jQueryEvent.stopPropagation()
            },
            _selectAllItems: function() {
                this._list.option("selectedItems", this._list.option("items").slice())
            },
            _unselectAllItems: function() {
                this._list.option("selectedItems", [])
            },
            _selectAllClickHandler: function() {
                this._selectAllCheckBox.option("value", !this._selectAllCheckBox.option("value"))
            },
            _isSelected: function($itemElement) {
                return this._list.isItemSelected($itemElement)
            },
            _processCheckedState: function($itemElement, checked) {
                if (checked)
                    this._list.selectItem($itemElement);
                else
                    this._list.unselectItem($itemElement)
            },
            dispose: function() {
                this._disposeSelectAll();
                this._list.element().removeClass(SELECT_DECORATOR_ENABLED_CLASS);
                this.callBase.apply(this, arguments)
            },
            _disposeSelectAll: function() {
                if (this._$selectAll) {
                    this._$selectAll.remove();
                    this._$selectAll = null
                }
            },
            handleClick: function($itemElement) {
                var newState = !this._isSelected($itemElement) || this._singleStrategy;
                this._processCheckedState($itemElement, newState);
                return true
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.decorator.reorder.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            translator = DX.translator,
            fx = DX.fx,
            support = DX.support,
            utils = DX.utils,
            fitIntoRange = utils.fitIntoRange;
        var ReorderScrollAnimator = DX.Animator.inherit({
                ctor: function(strategy) {
                    this.callBase();
                    this._strategy = strategy
                },
                _isFinished: function() {
                    return this._strategy.scrollFinished()
                },
                _step: function() {
                    this._strategy.scrollByStep()
                }
            });
        var LIST_EDIT_DECORATOR = "dxListEditDecorator",
            DRAG_START_EVENT_NAME = events.addNamespace("dxdragstart", LIST_EDIT_DECORATOR),
            DRAG_UPDATE_EVENT_NAME = events.addNamespace("dxdrag", LIST_EDIT_DECORATOR),
            DRAG_END_EVENT_NAME = events.addNamespace("dxdragend", LIST_EDIT_DECORATOR),
            REORDER_HANDLE_CONTAINER_CLASS = "dx-list-reorder-handle-container",
            REORDER_HANDLE_CLASS = "dx-list-reorder-handle",
            REOREDERING_ITEM_CLASS = "dx-list-item-reordering",
            REOREDERING_ITEM_GHOST_CLASS = "dx-list-item-ghost-reordering",
            LIST_REORDER_COMPATIBILITY_MODE_CLASS = "dx-list-reorder-compatibility-mode";
        ui.dxList.registerEditDecorator("reorder", "default", ui.dxList.EditDecorator.inherit({
            _init: function() {
                this._groupedEnabled = this._list.option("grouped");
                this._initAnimator()
            },
            _initAnimator: function() {
                this._scrollAnimator = new ReorderScrollAnimator(this)
            },
            _startAnimator: function() {
                if (!this._scrollAnimator.inProgress())
                    this._scrollAnimator.start()
            },
            _stopAnimator: function() {
                this._scrollAnimator.stop()
            },
            afterBag: function(config) {
                var $itemElement = config.$itemElement,
                    $container = config.$container;
                var $handle = $("<div>").addClass(REORDER_HANDLE_CLASS);
                $handle.on(DRAG_START_EVENT_NAME, {
                    direction: "vertical",
                    immediate: true
                }, $.proxy(this._dragStartHandler, this, $itemElement));
                $handle.on(DRAG_UPDATE_EVENT_NAME, $.proxy(this._dragHandler, this, $itemElement));
                $handle.on(DRAG_END_EVENT_NAME, $.proxy(this._dragEndHandler, this, $itemElement));
                $container.addClass(REORDER_HANDLE_CONTAINER_CLASS);
                $container.append($handle)
            },
            _dragStartHandler: function($itemElement, e) {
                if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
                    e.cancel = true;
                    return
                }
                this._stopPreviousAnimation();
                e.targetElements = [];
                this._cacheItemsPositions();
                this._startPointerOffset = e.pageY - $itemElement.offset().top;
                this._elementHeight = $itemElement.outerHeight();
                var itemIndex = this._list.getFlatIndexByItemElement($itemElement);
                this._startIndex = itemIndex;
                this._lastIndex = itemIndex;
                this._cacheScrollData();
                this._createGhost($itemElement);
                $itemElement.addClass(REOREDERING_ITEM_CLASS);
                this._toggleCompatibilityMode(true)
            },
            _stopPreviousAnimation: function() {
                fx.stop(this._$ghostItem, true)
            },
            _toggleCompatibilityMode: function(enabled) {
                this._list.element().toggleClass(LIST_REORDER_COMPATIBILITY_MODE_CLASS, !support.transform && enabled)
            },
            _cacheItemsPositions: function() {
                this._itemPositions = [];
                $.each(this._list.itemElements(), $.proxy(function(index, item) {
                    this._itemPositions.push($(item).position().top)
                }, this))
            },
            _getDraggingElementPosition: function() {
                return this._itemPositions[this._startIndex]
            },
            _getLastElementPosition: function() {
                return this._itemPositions[this._lastIndex]
            },
            _cacheScrollData: function() {
                this._list.updateDimensions();
                this._startScrollTop = this._list.scrollTop();
                this._scrollOffset = 0;
                this._scrollHeight = this._list.scrollHeight();
                this._clientHeight = this._list.clientHeight()
            },
            _scrollTop: function() {
                return this._startScrollTop + this._scrollOffset
            },
            _createGhost: function($itemElement) {
                this._$ghostItem = $itemElement.clone();
                this._$ghostItem.addClass(REOREDERING_ITEM_GHOST_CLASS).appendTo(this._list.itemsContainer());
                this._startGhostPosition = this._getDraggingElementPosition() - this._$ghostItem.position().top;
                translator.move(this._$ghostItem, {top: this._startGhostPosition})
            },
            _dragHandler: function($itemElement, e) {
                this._topOffset = e.offset.y;
                this._updateItemPositions();
                var pointerPosition = this._getPonterPosition();
                this._toggleScroll(pointerPosition)
            },
            _getPonterPosition: function() {
                return this._getDraggingElementPosition() + this._startPointerOffset + this._scrollOffset + this._topOffset
            },
            _toggleScroll: function(pointerPosition) {
                if (this._scrollHeight <= this._clientHeight)
                    return;
                var minOffset = this._elementHeight * .7,
                    topOffset = this._clientHeight - (pointerPosition - this._scrollTop()),
                    topOffsetRatio = topOffset / minOffset,
                    bottomOffset = pointerPosition - this._scrollTop(),
                    bottomOffsetRatio = bottomOffset / minOffset;
                if (topOffsetRatio < 1) {
                    this._stepSize = this._adjustRationIntoRange(topOffsetRatio);
                    this._startAnimator()
                }
                else if (bottomOffsetRatio < 1) {
                    this._stepSize = -this._adjustRationIntoRange(bottomOffsetRatio);
                    this._startAnimator()
                }
                else
                    this._stopAnimator()
            },
            _adjustRationIntoRange: function(ratio) {
                return fitIntoRange(Math.round(Math.abs(ratio - 1) * 7), 1, 7)
            },
            _updateItemPositions: function() {
                this._updateGhostPosition();
                this._updateOthersPositions()
            },
            _updateGhostPosition: function() {
                translator.move(this._$ghostItem, {top: this._startGhostPosition + this._scrollOffset + this._topOffset})
            },
            _updateOthersPositions: function() {
                var currentIndex = this._findItemIndexByPosition(this._getPonterPosition());
                if (this._lastIndex === currentIndex || this._groupedEnabled && !this._sameParent(currentIndex))
                    return;
                var currentIndexOffset = currentIndex - this._startIndex,
                    currentDirection = utils.sign(currentIndexOffset),
                    minIndex = Math.min(currentIndex, this._lastIndex),
                    maxIndex = Math.max(currentIndex, this._lastIndex);
                for (var itemIndex = minIndex; itemIndex <= maxIndex; itemIndex++) {
                    if (itemIndex === this._startIndex)
                        continue;
                    var $item = this._list.getItemElementByFlatIndex(itemIndex),
                        itemIndexOffset = itemIndex - this._startIndex,
                        itemDirection = utils.sign(itemIndexOffset),
                        offsetsDifference = Math.abs(itemIndexOffset) <= Math.abs(currentIndexOffset),
                        sameDirections = currentDirection === itemDirection,
                        setupPosition = offsetsDifference && sameDirections,
                        resetPosition = !offsetsDifference || !sameDirections;
                    fx.stop($item);
                    if (setupPosition)
                        fx.animate($item, {
                            type: "slide",
                            to: {top: this._elementHeight * -currentDirection},
                            duration: 300
                        });
                    if (resetPosition)
                        fx.animate($item, {
                            type: "slide",
                            to: {top: 0},
                            duration: 300
                        })
                }
                this._lastIndex = currentIndex
            },
            _sameParent: function(index) {
                var $dragging = this._list.getItemElementByFlatIndex(this._startIndex),
                    $over = this._list.getItemElementByFlatIndex(index);
                return $over.parent().get(0) === $dragging.parent().get(0)
            },
            scrollByStep: function() {
                this._scrollOffset += this._stepSize;
                this._list.scrollBy(this._stepSize);
                this._updateItemPositions()
            },
            scrollFinished: function() {
                var scrollTop = this._scrollTop(),
                    rejectScrollTop = scrollTop <= 0 && this._stepSize < 0,
                    rejectScrollBottom = scrollTop >= this._scrollHeight - this._clientHeight && this._stepSize > 0;
                return rejectScrollTop || rejectScrollBottom
            },
            _dragEndHandler: function($itemElement) {
                this._scrollAnimator.stop();
                fx.animate(this._$ghostItem, {
                    type: "slide",
                    to: {top: this._startGhostPosition + this._getLastElementPosition() - this._getDraggingElementPosition()},
                    duration: 300
                }).done($.proxy(function() {
                    $itemElement.removeClass(REOREDERING_ITEM_CLASS);
                    this._resetPositions();
                    this._list.reorderItem($itemElement, this._list.getItemElementByFlatIndex(this._lastIndex));
                    this._deleteGhost();
                    this._toggleCompatibilityMode(false)
                }, this))
            },
            _deleteGhost: function() {
                this._$ghostItem.remove()
            },
            _resetPositions: function() {
                var minIndex = Math.min(this._startIndex, this._lastIndex),
                    maxIndex = Math.max(this._startIndex, this._lastIndex);
                for (var itemIndex = minIndex; itemIndex <= maxIndex; itemIndex++) {
                    var $item = this._list.getItemElementByFlatIndex(itemIndex);
                    translator.resetPosition($item)
                }
            },
            _findItemIndexByPosition: function(position) {
                var minIndex = 0;
                var maxIndex = this._itemPositions.length - 1;
                var currentIndex;
                var currentPosition;
                while (minIndex <= maxIndex) {
                    currentIndex = (minIndex + maxIndex) / 2 | 0;
                    currentPosition = this._itemPositions[currentIndex];
                    if (currentPosition < position)
                        minIndex = currentIndex + 1;
                    else if (currentPosition > position)
                        maxIndex = currentIndex - 1;
                    else
                        return currentIndex
                }
                return fitIntoRange(minIndex, 0, Math.max(maxIndex, 0))
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.list.edit.provider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var editOptionsRegistry = [];
        var registerOption = function(enabledFunc, decoratorTypeFunc, decoratorSubTypeFunc) {
                editOptionsRegistry.push({
                    enabled: enabledFunc,
                    decoratorType: decoratorTypeFunc,
                    decoratorSubType: decoratorSubTypeFunc
                })
            };
        registerOption(function() {
            return this.option("menuItems").length
        }, function() {
            return "menu"
        }, function() {
            return this.option("menuMode")
        });
        registerOption(function() {
            return !this.option("menuItems").length && this.option("allowItemDeleting")
        }, function() {
            var mode = this.option("itemDeleteMode");
            return mode === "toggle" || mode === "slideButton" || mode === "swipe" || mode === "static" ? "delete" : "menu"
        }, function() {
            var mode = this.option("itemDeleteMode");
            if (mode === "slideItem")
                mode = "slide";
            if (mode === "hold")
                mode = "context";
            return mode
        });
        registerOption(function() {
            return this.option("selectionMode") != "none" && this.option("showSelectionControls")
        }, function() {
            return "selection"
        }, function() {
            return "default"
        });
        registerOption(function() {
            return this.option("allowItemReordering")
        }, function() {
            return "reorder"
        }, function() {
            return "default"
        });
        var LIST_ITEM_BEFORE_BAG_CLASS = "dx-list-item-before-bag",
            LIST_ITEM_AFTER_BAG_CLASS = "dx-list-item-after-bag",
            DECORATOR_BEFORE_BAG_CREATE_METHOD = "beforeBag",
            DECORATOR_AFTER_BAG_CREATE_METHOD = "afterBag",
            DECORATOR_MODIFY_ELEMENT_METHOD = "modifyElement",
            DECORATOR_AFTER_RENDER_METHOD = "afterRender";
        ui.dxList.EditProvider = DX.Class.inherit({
            ctor: function(list) {
                this._list = list;
                this._fetchRequiredDecorators()
            },
            dispose: function() {
                if (this._decorators && this._decorators.length)
                    $.each(this._decorators, function(_, decorator) {
                        decorator.dispose()
                    })
            },
            _fetchRequiredDecorators: function() {
                this._decorators = [];
                $.each(editOptionsRegistry, $.proxy(function(_, option) {
                    var optionEnabled = option.enabled.call(this._list);
                    if (optionEnabled) {
                        var decoratorType = option.decoratorType.call(this._list),
                            decoratorSubType = option.decoratorSubType.call(this._list),
                            decorator = this._createDecorator(decoratorType, decoratorSubType);
                        this._decorators.push(decorator)
                    }
                }, this))
            },
            _createDecorator: function(type, subType) {
                var decoratorClass = this._findDecorator(type, subType);
                return new decoratorClass(this._list)
            },
            _findDecorator: function(type, subType) {
                var foundDecorator = ui.dxList.EditDecoratorsRegistry[type][subType];
                if (!foundDecorator)
                    throw DX.Error("E1012", type, subType);
                return foundDecorator
            },
            modifyItemElement: function(args) {
                var $itemElement = $(args.itemElement);
                var config = {$itemElement: $itemElement};
                this._prependBeforeBags($itemElement, config);
                this._appendAfterBags($itemElement, config);
                this._applyDecorators(DECORATOR_MODIFY_ELEMENT_METHOD, config)
            },
            afterItemsRendered: function() {
                this._applyDecorators(DECORATOR_AFTER_RENDER_METHOD)
            },
            _prependBeforeBags: function($itemElement, config) {
                var $beforeBags = this._collectDecoratorsMarkup(DECORATOR_BEFORE_BAG_CREATE_METHOD, config, LIST_ITEM_BEFORE_BAG_CLASS);
                $itemElement.prepend($beforeBags)
            },
            _appendAfterBags: function($itemElement, config) {
                var $afterBags = this._collectDecoratorsMarkup(DECORATOR_AFTER_BAG_CREATE_METHOD, config, LIST_ITEM_AFTER_BAG_CLASS);
                $itemElement.append($afterBags)
            },
            _collectDecoratorsMarkup: function(method, config, containerClass) {
                var $collector = $("<div />");
                $.each(this._decorators, function() {
                    var $container = $("<div />").addClass(containerClass);
                    this[method]($.extend({$container: $container}, config));
                    if ($container.children().length)
                        $collector.append($container)
                });
                return $collector.children()
            },
            _applyDecorators: function(method, config) {
                $.each(this._decorators, function() {
                    this[method](config)
                })
            },
            _handlerExists: function(name) {
                if (!this._decorators)
                    return false;
                var decorators = this._decorators,
                    length = decorators.length;
                for (var i = 0; i < length; i++)
                    if (decorators[i][name] !== $.noop)
                        return true;
                return false
            },
            _eventHandler: function(name, $itemElement, e) {
                if (!this._decorators)
                    return false;
                var response = false,
                    decorators = this._decorators,
                    length = decorators.length;
                for (var i = 0; i < length; i++) {
                    response = decorators[i][name]($itemElement, e);
                    if (response)
                        break
                }
                return response
            },
            handleClick: function($itemElement, e) {
                return this._eventHandler("handleClick", $itemElement, e)
            },
            contextMenuHandlerExists: function() {
                return this._handlerExists("handleContextMenu")
            },
            handleContextMenu: function($itemElement, e) {
                return this._eventHandler("handleContextMenu", $itemElement, e)
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tileView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var TILEVIEW_CLASS = "dx-tileview",
            TILEVIEW_CONTAINER_CLASS = "dx-tileview-wrapper",
            TILEVIEW_ITEM_CLASS = "dx-tile",
            TILEVIEW_ITEM_SELECTOR = "." + TILEVIEW_ITEM_CLASS,
            TILEVIEW_ITEM_DATA_KEY = "dxTileData";
        DX.registerComponent("dxTileView", ui, ui.CollectionWidget.inherit({
            _activeStateUnit: TILEVIEW_ITEM_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    items: null,
                    showScrollbar: false,
                    height: 500,
                    baseItemWidth: 100,
                    baseItemHeight: 100,
                    itemMargin: 20,
                    activeStateEnabled: true,
                    indicateLoading: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                hoverStateEnabled: true,
                                focusStateEnabled: true
                            }
                        }])
            },
            _itemClass: function() {
                return TILEVIEW_ITEM_CLASS
            },
            _itemDataKey: function() {
                return TILEVIEW_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$container
            },
            _init: function() {
                this.callBase();
                this._initScrollView()
            },
            _dataSourceLoadingChangedHandler: function(isLoading) {
                var scrollView = this._scrollView;
                if (!scrollView)
                    return;
                if (isLoading && this.option("indicateLoading"))
                    scrollView.startLoading();
                else
                    scrollView.finishLoading()
            },
            _hideLoadingIfLoadIndicationOff: function() {
                if (!this.option("indicateLoading"))
                    this._dataSourceLoadingChangedHandler(false)
            },
            _initScrollView: function() {
                this._scrollView = this._createComponent(this.element(), "dxScrollView", {
                    direction: "horizontal",
                    scrollByContent: true,
                    useKeyboard: false,
                    showScrollbar: this.option("showScrollbar"),
                    disabled: this.option("disabled")
                });
                this._$container = this._scrollView.content();
                this._$container.addClass(TILEVIEW_CONTAINER_CLASS);
                this._scrollView.option("onUpdated", $.proxy(this._renderGeometry, this))
            },
            _render: function() {
                this.callBase();
                this.element().addClass(TILEVIEW_CLASS);
                this.cellsPerColumn = 1;
                this._updateScrollView();
                this._fireContentReadyAction()
            },
            _renderContent: function() {
                this._renderContentImpl()
            },
            _updateScrollView: function() {
                this._scrollView.option("rtlEnabled", this.option("rtlEnabled"));
                this._renderGeometry();
                this._scrollView.update();
                this._indicateLoadingIfAlreadyStarted()
            },
            _indicateLoadingIfAlreadyStarted: function() {
                if (this._isDataSourceLoading())
                    this._dataSourceLoadingChangedHandler(true)
            },
            _renderGeometry: function() {
                var items = this.option("items") || [],
                    maxItemHeight = Math.max.apply(Math, $.map(items || [], function(item) {
                        return Math.round(item.heightRatio || 1)
                    }));
                this.cellsPerColumn = Math.floor(this.element().height() / (this.option("baseItemHeight") + this.option("itemMargin")));
                this.cellsPerColumn = Math.max(this.cellsPerColumn, maxItemHeight);
                this.cells = [];
                this.cells.push(new Array(this.cellsPerColumn));
                this._arrangeItems(items);
                this._$container.width(this.cells.length * this.option("baseItemWidth") + (this.cells.length + 1) * this.option("itemMargin"))
            },
            _arrangeItems: function(items) {
                var that = this;
                this._itemsPositions = [];
                $.each(items, function(index, item) {
                    var currentItem = {};
                    currentItem.widthRatio = item.widthRatio || 1;
                    currentItem.heightRatio = item.heightRatio || 1;
                    currentItem.index = index;
                    currentItem.widthRatio = currentItem.widthRatio <= 0 ? 0 : Math.round(currentItem.widthRatio);
                    currentItem.heightRatio = currentItem.heightRatio <= 0 ? 0 : Math.round(currentItem.heightRatio);
                    var itemPosition = that._getItemPosition(currentItem);
                    if (itemPosition.x === -1)
                        itemPosition.x = that.cells.push(new Array(that.cellsPerColumn)) - 1;
                    that._occupyCells(currentItem, itemPosition);
                    that._arrangeItem(currentItem, itemPosition);
                    that._itemsPositions.push(itemPosition)
                })
            },
            _getItemPosition: function(item) {
                var position = {
                        x: -1,
                        y: 0
                    };
                for (var col = 0; col < this.cells.length; col++) {
                    for (var row = 0; row < this.cellsPerColumn; row++)
                        if (this._itemFit(col, row, item)) {
                            position.x = col;
                            position.y = row;
                            break
                        }
                    if (position.x > -1)
                        break
                }
                return position
            },
            _itemFit: function(column, row, item) {
                var result = true;
                if (row + item.heightRatio > this.cellsPerColumn)
                    return false;
                for (var columnIndex = column; columnIndex < column + item.widthRatio; columnIndex++)
                    for (var rowIndex = row; rowIndex < row + item.heightRatio; rowIndex++)
                        if (this.cells.length - 1 < columnIndex)
                            this.cells.push(new Array(this.cellsPerColumn));
                        else if (this.cells[columnIndex][rowIndex] !== undefined) {
                            result = false;
                            break
                        }
                return result
            },
            _occupyCells: function(item, itemPosition) {
                for (var i = itemPosition.x; i < itemPosition.x + item.widthRatio; i++)
                    for (var j = itemPosition.y; j < itemPosition.y + item.heightRatio; j++)
                        this.cells[i][j] = item.index
            },
            _arrangeItem: function(item, itemPosition) {
                var baseItemHeight = this.option("baseItemHeight"),
                    baseItemWidth = this.option("baseItemWidth"),
                    itemMargin = this.option("itemMargin"),
                    leftOffset,
                    offsetCorrection = this.option("rtlEnabled") ? this._$container.width() : 0,
                    $item = this._itemElements().eq(item.index);
                if (!offsetCorrection)
                    leftOffset = itemPosition.x * baseItemWidth + (itemPosition.x + 1) * itemMargin;
                else {
                    var startOffsetPosition = itemPosition.x * baseItemWidth,
                        itemBasePartWidth = baseItemWidth + itemMargin,
                        itemWidth = itemBasePartWidth * item.widthRatio,
                        subitemMarginsWidth = itemPosition.x * itemMargin;
                    leftOffset = offsetCorrection - (startOffsetPosition + itemWidth + subitemMarginsWidth)
                }
                $item.css({
                    height: item.heightRatio * baseItemHeight + (item.heightRatio - 1) * itemMargin,
                    width: item.widthRatio * baseItemWidth + (item.widthRatio - 1) * itemMargin,
                    top: itemPosition.y * baseItemHeight + (itemPosition.y + 1) * itemMargin,
                    left: leftOffset,
                    display: item.widthRatio <= 0 || item.heightRatio <= 0 ? "none" : ""
                })
            },
            _moveFocus: function(location) {
                var FOCUS_UP = "up",
                    FOCUS_DOWN = "down",
                    FOCUS_LEFT = this.option("rtlEnabled") ? "right" : "left",
                    FOCUS_RIGHT = this.option("rtlEnabled") ? "left" : "right",
                    FOCUS_PAGE_UP = "pageup",
                    FOCUS_PAGE_DOWN = "pagedown";
                var cells = this.cells,
                    index = this.option("focusedElement").index(),
                    newTargetCol = this._itemsPositions[index].x,
                    targetRow = this._itemsPositions[index].y,
                    newTargetIndex;
                switch (location) {
                    case FOCUS_PAGE_UP:
                    case FOCUS_UP:
                        while (targetRow > 0 && index === cells[newTargetCol][targetRow])
                            targetRow--;
                        if (targetRow < 0)
                            targetRow = 0;
                        break;
                    case FOCUS_PAGE_DOWN:
                    case FOCUS_DOWN:
                        while (targetRow < cells[0].length && index === cells[newTargetCol][targetRow])
                            targetRow++;
                        if (targetRow === cells[0].length)
                            targetRow = cells[0].length - 1;
                        break;
                    case FOCUS_RIGHT:
                        while (newTargetCol < cells.length && index === cells[newTargetCol][targetRow])
                            newTargetCol++;
                        if (newTargetCol === cells.length)
                            newTargetCol = cells.length - 1;
                        break;
                    case FOCUS_LEFT:
                        while (newTargetCol >= 0 && index === cells[newTargetCol][targetRow])
                            newTargetCol--;
                        if (newTargetCol < 0)
                            newTargetCol = 0;
                        break;
                    default:
                        this.callBase.apply(this, arguments);
                        return
                }
                newTargetIndex = cells[newTargetCol][targetRow];
                var $newTarget = this._itemElements().eq(newTargetIndex);
                this.option("focusedElement", $newTarget);
                this._scrollToItem($newTarget)
            },
            _scrollToItem: function($itemElement) {
                if (!$itemElement.length)
                    return;
                var itemPosition = $itemElement.position().left,
                    itemWidth = $itemElement.outerWidth(),
                    itemRight = itemPosition + itemWidth,
                    scrollLeft = this._scrollView.scrollLeft(),
                    clientWidht = this._scrollView.element().outerWidth();
                if (scrollLeft <= itemPosition && itemRight <= scrollLeft + clientWidht)
                    return;
                if (scrollLeft > itemPosition)
                    this._scrollView.scrollTo(itemPosition - this.option("itemMargin"));
                else
                    this._scrollView.scrollTo(itemPosition + itemWidth - clientWidht + this.option("itemMargin"))
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"showScrollbar":
                        this._initScrollView();
                        break;
                    case"disabled":
                        this._scrollView.option("disabled", args.value);
                        break;
                    case"baseItemWidth":
                    case"baseItemHeight":
                    case"itemMargin":
                        this._renderGeometry();
                        break;
                    case"height":
                        this.callBase(args);
                        this._renderGeometry();
                        this._scrollView.update();
                        break;
                    case"indicateLoading":
                        this._hideLoadingIfLoadIndicationOff();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            scrollPosition: function() {
                return this._scrollView.scrollOffset().left
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.trackBar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx;
        var TRACKBAR_CLASS = "dx-trackbar",
            TRACKBAR_CONTAINER_CLASS = "dx-trackbar-container",
            TRACKBAR_RANGE_CLASS = "dx-trackbar-range",
            TRACKBAR_WRAPPER_CLASS = "dx-trackbar-wrapper";
        DX.registerComponent("dxTrackBar", ui, ui.Editor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    min: 0,
                    max: 100,
                    value: 0
                })
            },
            _render: function() {
                this.element().addClass(TRACKBAR_CLASS);
                this._renderWrapper();
                this._renderContainer();
                this._renderRange();
                this.callBase();
                this._renderValue()
            },
            _renderWrapper: function() {
                this._$wrapper = $("<div>").addClass(TRACKBAR_WRAPPER_CLASS).appendTo(this.element())
            },
            _renderContainer: function() {
                this._$bar = $("<div>").addClass(TRACKBAR_CONTAINER_CLASS).appendTo(this._$wrapper)
            },
            _renderRange: function() {
                this._$range = $("<div>").addClass(TRACKBAR_RANGE_CLASS).appendTo(this._$bar)
            },
            _renderValue: function() {
                var val = this.option("value"),
                    min = this.option("min"),
                    max = this.option("max");
                if (min > max)
                    return;
                if (val < min) {
                    this.option("value", min);
                    this._currentRatio = 0;
                    return
                }
                if (val > max) {
                    this.option("value", max);
                    this._currentRatio = 1;
                    return
                }
                var ratio = min === max ? 0 : (val - min) / (max - min);
                this._animateRange({width: ratio * 100 + "%"});
                this.setAria({
                    valuemin: this.option("min"),
                    valuemax: max,
                    valuenow: val
                });
                this._currentRatio = ratio
            },
            _animateRange: function(configTo) {
                fx.stop(this._$range);
                if (!this._needPreventAnimation)
                    fx.animate(this._$range, {
                        type: "custom",
                        duration: 100,
                        to: configTo,
                        complete: $.proxy(this._rangeAnimationCompleteHandler, this)
                    })
            },
            _rangeAnimationCompleteHandler: $.noop,
            _optionChanged: function(args) {
                switch (args.name) {
                    case"value":
                        this._renderValue();
                        this.callBase(args);
                        break;
                    case"max":
                    case"min":
                        this._renderValue();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _dispose: function() {
                fx.stop(this._$range);
                this.callBase()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.progressBar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx;
        var PROGRESSBAR_CLASS = "dx-progressbar",
            PROGRESSBAR_CONTAINER_CLASS = "dx-progressbar-container",
            PROGRESSBAR_RANGE_CONTAINER_CLASS = "dx-progressbar-range-container",
            PROGRESSBAR_RANGE_CLASS = "dx-progressbar-range",
            PROGRESSBAR_WRAPPER_CLASS = "dx-progressbar-wrapper",
            PROGRESSBAR_STATUS_CLASS = "dx-progressbar-status",
            PROGRESSBAR_INDETERMINATE_SEGMENT_CONTAINER = "dx-progressbar-animating-container",
            PROGRESSBAR_INDETERMINATE_SEGMENT = "dx-progressbar-animating-segment";
        DX.registerComponent("dxProgressBar", ui, ui.dxTrackBar.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    statusFormat: function(ratio, value) {
                        return "Progress: " + Math.round(ratio * 100) + "%"
                    },
                    showStatus: true,
                    onComplete: null,
                    activeStateEnabled: false,
                    statusPosition: "bottom left",
                    _animatingSegmentCount: 0
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: [{platform: "win8"}],
                            options: {_animatingSegmentCount: 5}
                        }, {
                            device: function(device) {
                                return device.platform === "android"
                            },
                            options: {_animatingSegmentCount: 2}
                        }])
            },
            _init: function() {
                this.callBase()
            },
            _render: function() {
                this._createCompleteAction();
                this._renderStatus();
                this.callBase();
                this.element().addClass(PROGRESSBAR_CLASS);
                this.setAria("role", "progressbar");
                this._$wrapper.addClass(PROGRESSBAR_WRAPPER_CLASS);
                this._$bar.addClass(PROGRESSBAR_CONTAINER_CLASS);
                var $rangeContainer = $("<div>").addClass(PROGRESSBAR_RANGE_CONTAINER_CLASS).appendTo(this._$wrapper).append(this._$bar);
                this._$range.addClass(PROGRESSBAR_RANGE_CLASS);
                this._toggleStatus(this.option("showStatus"))
            },
            _createCompleteAction: function() {
                this._completeAction = this._createActionByOption("onComplete")
            },
            _renderStatus: function() {
                this._$status = $("<div>").addClass(PROGRESSBAR_STATUS_CLASS)
            },
            _renderIndeterminateState: function() {
                this._$segmentContainer = $("<div>").addClass(PROGRESSBAR_INDETERMINATE_SEGMENT_CONTAINER);
                var segments = this.option("_animatingSegmentCount");
                for (var i = 0; i < segments; i++)
                    $("<div>").addClass(PROGRESSBAR_INDETERMINATE_SEGMENT).addClass(PROGRESSBAR_INDETERMINATE_SEGMENT + "-" + (i + 1)).appendTo(this._$segmentContainer);
                this._$segmentContainer.appendTo(this._$wrapper)
            },
            _toggleStatus: function(value) {
                var splittedPosition = this.option("statusPosition").split(" ");
                if (value)
                    if (splittedPosition[0] == "top" || splittedPosition[0] == "left")
                        this._$status.prependTo(this._$wrapper);
                    else
                        this._$status.appendTo(this._$wrapper);
                else
                    this._$status.detach();
                this._togglePositionClass()
            },
            _togglePositionClass: function() {
                var position = this.option("statusPosition"),
                    splittedPosition = position.split(" ");
                this._$wrapper.removeClass("dx-position-top-left dx-position-top-right dx-position-bottom-left dx-position-bottom-right dx-position-left dx-position-right");
                var positionClass = "dx-position-" + splittedPosition[0];
                if (splittedPosition[1])
                    positionClass += "-" + splittedPosition[1];
                this._$wrapper.addClass(positionClass)
            },
            _toggleIndeterminateState: function(value) {
                if (value) {
                    this._renderIndeterminateState();
                    this._$bar.toggle(false)
                }
                else {
                    this._$bar.toggle(true);
                    this._$segmentContainer.remove();
                    delete this._$segmentContainer
                }
            },
            _renderValue: function() {
                var val = this.option("value"),
                    max = this.option("max");
                if (!val && val !== 0) {
                    this._toggleIndeterminateState(true);
                    return
                }
                if (this._$segmentContainer)
                    this._toggleIndeterminateState(false);
                if (val == max)
                    this._completeAction();
                this.callBase();
                this._setStatus()
            },
            _setStatus: function() {
                var format = this.option("statusFormat");
                if ($.isFunction(format))
                    format = $.proxy(format, this);
                else
                    format = function(value) {
                        return value
                    };
                var statusText = format(this._currentRatio, this.option("value"));
                this._$status.text(statusText)
            },
            _dispose: function() {
                this._$status.remove();
                this.callBase()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"statusFormat":
                        this._setStatus();
                        break;
                    case"showStatus":
                        this._toggleStatus(args.value);
                        break;
                    case"statusPosition":
                        this._toggleStatus(this.option("showStatus"));
                        break;
                    case"onComplete":
                        this._createCompleteAction();
                        break;
                    case"_animatingSegmentCount":
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.slider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            fx = DX.fx,
            utils = DX.utils,
            translator = DX.translator,
            transionEndEventName = DX.support.transitionEndEventName;
        var SLIDER_CLASS = "dx-slider",
            SLIDER_WRAPPER_CLASS = "dx-slider-wrapper",
            SLIDER_HANDLE_CLASS = "dx-slider-handle",
            SLIDER_HANDLE_SELECTOR = ".dx-slider-handle",
            SLIDER_BAR_CLASS = "dx-slider-bar",
            SLIDER_RANGE_CLASS = "dx-slider-range",
            SLIDER_RANGE_VISIBLE_CLASS = "dx-slider-range-visible",
            SLIDER_LABEL_CLASS = "dx-slider-label",
            SLIDER_LABEL_POSITION_CLASS_PREFIX = "dx-slider-label-position-",
            SLIDER_TOOLTIP_CLASS = "dx-slider-tooltip",
            SLIDER_TOOLTIP_POSITION_CLASS_PREFIX = "dx-slider-tooltip-position-";
        var dxSliderHandle = ui.Widget.inherit({
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        hoverStateEnabled: false,
                        value: 50,
                        tooltipEnabled: false,
                        tooltipFormat: function(v) {
                            return v
                        },
                        tooltipPosition: "top",
                        tooltipShowMode: "onHover",
                        tooltipFitIn: null
                    })
                },
                _render: function() {
                    this.callBase();
                    this.element().addClass(SLIDER_HANDLE_CLASS);
                    this._renderTooltip();
                    this.setAria({
                        role: "slider",
                        valuenow: this.option("value"),
                        label: this.option("value")
                    })
                },
                _renderTooltip: function() {
                    if (this.option("tooltipEnabled")) {
                        if (!this._$tooltip) {
                            this._$tooltip = $("<div>").appendTo(this.element());
                            this._tooltip = this._createComponent(this._$tooltip, "dxTooltip", {
                                visible: true,
                                height: undefined,
                                target: this.element(),
                                closeOnOutsideClick: false,
                                container: this.element(),
                                closeOnBackButton: false,
                                closeOnTargetScroll: false,
                                animation: null,
                                arrowPosition: null
                            })
                        }
                        this._renderTooltipPosition();
                        this._renderTooltipShowMode();
                        this._renderValue()
                    }
                    else
                        this._removeTooltip()
                },
                _visibilityChanged: function() {
                    this._dimensionChanged()
                },
                _dimensionChanged: function() {
                    this._repaintTooltip()
                },
                _removeTooltip: function() {
                    if (!this._$tooltip)
                        return;
                    this._$tooltip.remove();
                    delete this._$tooltip;
                    delete this._tooltip
                },
                _renderTooltipPosition: function() {
                    if (!this._tooltip)
                        return;
                    var position = this.option("tooltipPosition");
                    if ($.type(position) === "string")
                        position = position + "None";
                    this._tooltip.option("position", position)
                },
                _repaintTooltip: function() {
                    if (this._tooltip)
                        this._tooltip.repaint()
                },
                _renderValue: function() {
                    if (!this._tooltip)
                        return;
                    var format = this.option("tooltipFormat"),
                        value = format(this.option("value"));
                    this._tooltip.content().html(value);
                    this._fitTooltipPosition()
                },
                _renderTooltipShowMode: function() {
                    this.element().toggleClass("dx-slider-tooltip-on-hover", /^onhover$/i.test(this.option("tooltipShowMode")))
                },
                _fitTooltipPosition: function() {
                    if (!this._$tooltip)
                        return;
                    var $tooltipContent = this._tooltip.content().parent(),
                        tooltipWidth = $tooltipContent.outerWidth(),
                        $boundElement = this.option("tooltipFitIn"),
                        boundElementWidth = $boundElement.outerWidth(),
                        boundElementLeft = $boundElement.offset().left,
                        boundElementRight = boundElementLeft + boundElementWidth,
                        $element = this.element(),
                        elementWidth = $element.outerWidth(),
                        elementLeft = $element.offset().left,
                        elementRight = elementLeft + elementWidth,
                        idealOffset = Math.round(elementWidth / 2 - tooltipWidth / 2),
                        minOffset = Math.ceil(boundElementLeft - elementLeft),
                        maxOffset = Math.floor(boundElementRight - elementRight) + idealOffset * 2,
                        newOffset = Math.min(Math.max(minOffset, idealOffset), maxOffset);
                    translator.move($tooltipContent, {left: newOffset})
                },
                _clean: function() {
                    this.callBase();
                    delete this._$tooltip;
                    delete this._tooltip
                },
                _optionChanged: function(args) {
                    switch (args.name) {
                        case"tooltipFormat":
                            this._renderValue();
                            break;
                        case"value":
                            this._renderValue();
                            this.setAria("valuenow", args.value);
                            break;
                        case"tooltipEnabled":
                            this._renderTooltip();
                            break;
                        case"tooltipPosition":
                            this._renderTooltipPosition();
                            break;
                        case"tooltipShowMode":
                            this._renderTooltipShowMode();
                            break;
                        case"tooltipFitIn":
                            this._fitTooltipPosition();
                            break;
                        case"_templates":
                        case"templateProvider":
                            break;
                        default:
                            this.callBase(args)
                    }
                },
                fitTooltipPosition: function() {
                    this._fitTooltipPosition()
                },
                repaint: function() {
                    this._repaintTooltip();
                    this._renderTooltipPosition();
                    this._fitTooltipPosition()
                }
            });
        DX.registerComponent("dxSlider", ui, ui.dxTrackBar.inherit({
            _activeStateUnit: SLIDER_HANDLE_SELECTOR,
            _supportedKeys: function() {
                var isRTL = this.option("rtlEnabled");
                var that = this,
                    moveHandleRight = function(step) {
                        var val = that.option("value");
                        step = that._valueStep(step);
                        val = isRTL ? val - step : val + step;
                        that.option("value", val)
                    },
                    moveHandleLeft = function(step) {
                        var val = that.option("value");
                        step = that._valueStep(step);
                        val = isRTL ? val + step : val - step;
                        that.option("value", val)
                    };
                return $.extend(this.callBase(), {
                        leftArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleLeft(this.option("step"))
                        },
                        rightArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleRight(this.option("step"))
                        },
                        pageUp: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleRight(this.option("step") * this.option("keyStep"))
                        },
                        pageDown: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleLeft(this.option("step") * this.option("keyStep"))
                        },
                        home: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var min = this.option("min");
                            this.option("value", min)
                        },
                        end: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var max = this.option("max");
                            this.option("value", max)
                        }
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    step: 1,
                    value: 50,
                    showRange: true,
                    tooltip: {
                        enabled: false,
                        format: function(value) {
                            return value
                        },
                        position: "top",
                        showMode: "onHover"
                    },
                    label: {
                        visible: false,
                        position: "bottom",
                        format: function(value) {
                            return value
                        }
                    },
                    keyStep: 1
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                focusStateEnabled: true,
                                hoverStateEnabled: true
                            }
                        }])
            },
            _render: function() {
                this.element().addClass(SLIDER_CLASS);
                this.callBase();
                this._renderLabels();
                this._renderStartHandler();
                this._renderAriaMinAndMax()
            },
            _visibilityChanged: function() {
                this.repaint()
            },
            _renderWrapper: function() {
                this.callBase();
                this._$wrapper.addClass(SLIDER_WRAPPER_CLASS);
                this._createComponent(this._$wrapper, "dxSwipeable", {
                    elastic: false,
                    immediate: true,
                    onStart: $.proxy(this._swipeStartHandler, this),
                    onUpdated: $.proxy(this._swipeUpdateHandler, this),
                    onEnd: $.proxy(this._swipeEndHandler, this),
                    itemSizeFunc: $.proxy(this._itemWidthFunc, this)
                })
            },
            _renderContainer: function() {
                this.callBase();
                this._$bar.addClass(SLIDER_BAR_CLASS);
                this._$bar.off(transionEndEventName + "." + this.NAME).on(transionEndEventName, $.proxy(this._fitHandleTooltipPosition, this))
            },
            _renderRange: function() {
                this.callBase();
                this._$range.addClass(SLIDER_RANGE_CLASS);
                this._renderHandle();
                this._renderRangeVisibility()
            },
            _renderRangeVisibility: function() {
                this._$range.toggleClass(SLIDER_RANGE_VISIBLE_CLASS, Boolean(this.option("showRange")))
            },
            _renderHandle: function() {
                this._$handle = this._renderHandleImpl(this.option("value"), this._$handle)
            },
            _renderHandleImpl: function(value, $element) {
                var $handle = $element || $("<div>").appendTo(this._$range),
                    format = this._normalizeFormat(this.option("tooltip.format")),
                    tooltipEnabled = this.option("tooltip.enabled"),
                    tooltipPosition = this.option("tooltip.position");
                this.element().toggleClass(SLIDER_TOOLTIP_POSITION_CLASS_PREFIX + "bottom", tooltipEnabled && tooltipPosition === "bottom").toggleClass(SLIDER_TOOLTIP_POSITION_CLASS_PREFIX + "top", tooltipEnabled && tooltipPosition === "top");
                this._createComponent($handle, "dxSliderHandle", {
                    value: value,
                    tooltipEnabled: tooltipEnabled,
                    tooltipPosition: tooltipPosition,
                    tooltipFormat: format,
                    tooltipShowMode: this.option("tooltip.showMode"),
                    tooltipFitIn: this.element()
                });
                return $handle
            },
            _renderAriaMinAndMax: function() {
                this.setAria({
                    valuemin: this.option("min"),
                    valuemax: this.option("max")
                }, this._$handle)
            },
            _renderLabels: function() {
                this.element().removeClass(SLIDER_LABEL_POSITION_CLASS_PREFIX + "bottom").removeClass(SLIDER_LABEL_POSITION_CLASS_PREFIX + "top");
                if (this.option("label.visible")) {
                    var min = this.option("min"),
                        max = this.option("max"),
                        position = this.option("label.position"),
                        format = this._normalizeFormat(this.option("label.format"));
                    if (!this._$minLabel)
                        this._$minLabel = $("<div>").addClass(SLIDER_LABEL_CLASS).appendTo(this._$wrapper);
                    this._$minLabel.html(format(min));
                    if (!this._$maxLabel)
                        this._$maxLabel = $("<div>").addClass(SLIDER_LABEL_CLASS).appendTo(this._$wrapper);
                    this._$maxLabel.html(format(max));
                    this.element().addClass(SLIDER_LABEL_POSITION_CLASS_PREFIX + position)
                }
                else {
                    if (this._$minLabel) {
                        this._$minLabel.remove();
                        delete this._$minLabel
                    }
                    if (this._$maxLabel) {
                        this._$maxLabel.remove();
                        delete this._$maxLabel
                    }
                }
            },
            _normalizeFormat: function(formatSource) {
                var format = formatSource;
                if (typeof formatSource === "string")
                    format = function(value) {
                        return Globalize.format(value, formatSource)
                    };
                else if ($.isFunction(formatSource))
                    format = $.proxy(format, this);
                else
                    format = function(value) {
                        return value
                    };
                return format
            },
            _updateHandleAriaLabel: function() {
                this.setAria("label", this.option("value"), this._$handle)
            },
            _renderDimensions: function() {
                this.callBase();
                if (this._$bar) {
                    var barMarginWidth = this._$bar.outerWidth(true) - this._$bar.outerWidth();
                    this._$bar.width(this.option("width") - barMarginWidth)
                }
            },
            _renderStartHandler: function() {
                var pointerDownEventName = events.addNamespace("dxpointerdown", this.NAME),
                    clickEventName = events.addNamespace("dxclick", this.NAME),
                    startAction = this._createAction($.proxy(this._startHandler, this));
                this.element().off(pointerDownEventName).on(pointerDownEventName, function(e) {
                    if (events.isMouseEvent(e))
                        startAction({jQueryEvent: e})
                }).off(clickEventName).on(clickEventName, function(e) {
                    startAction({jQueryEvent: e})
                })
            },
            _itemWidthFunc: function() {
                return this.element().width() / this._swipePixelRatio()
            },
            _swipeStartHandler: function(e) {
                var rtlEnabled = this.option("rtlEnabled"),
                    startOffset,
                    endOffset;
                if (events.isTouchEvent(e.jQueryEvent))
                    this._createAction($.proxy(this._startHandler, this))({jQueryEvent: e.jQueryEvent});
                this._toggleActiveState(this._activeHandle(), true);
                this._startOffset = this._currentRatio;
                startOffset = this._startOffset * this._swipePixelRatio();
                endOffset = (1 - this._startOffset) * this._swipePixelRatio();
                e.jQueryEvent.maxLeftOffset = rtlEnabled ? endOffset : startOffset;
                e.jQueryEvent.maxRightOffset = rtlEnabled ? startOffset : endOffset;
                this._needPreventAnimation = true
            },
            _swipeEndHandler: function(e) {
                var offsetDirection = this.option("rtlEnabled") ? -1 : 1;
                delete this._needPreventAnimation;
                this._changeValueOnSwipe(this._startOffset + offsetDirection * e.jQueryEvent.targetOffset / this._swipePixelRatio());
                delete this._startOffset;
                this._renderValue();
                this._toggleActiveState(this._activeHandle(), false)
            },
            _activeHandle: function() {
                return this._$handle
            },
            _swipeUpdateHandler: function(e) {
                this._saveValueChangeEvent(e);
                this._updateHandlePosition(e)
            },
            _updateHandlePosition: function(e) {
                var offsetDirection = this.option("rtlEnabled") ? -1 : 1;
                var newRatio = this._startOffset + offsetDirection * e.jQueryEvent.offset / this._swipePixelRatio();
                this._$range.width(newRatio * 100 + "%");
                this._changeValueOnSwipe(newRatio)
            },
            _swipePixelRatio: function() {
                var min = this.option("min"),
                    max = this.option("max"),
                    step = this._valueStep(this.option("step"));
                return (max - min) / step
            },
            _valueStep: function(step) {
                if (!step || isNaN(step))
                    step = 1;
                step = parseFloat(step.toFixed(5));
                if (step === 0)
                    step = 0.00001;
                return step
            },
            _changeValueOnSwipe: function(ratio) {
                var min = this.option("min"),
                    max = this.option("max"),
                    step = this._valueStep(this.option("step")),
                    newChange = ratio * (max - min),
                    newValue = min + newChange;
                if (step < 0)
                    return;
                if (newValue === max || newValue === min)
                    this.option("value", newValue);
                else {
                    var stepChunks = (step + "").split('.'),
                        exponent = stepChunks.length > 1 ? stepChunks[1].length : exponent;
                    newValue = Number((Math.round(newChange / step) * step + min).toFixed(exponent));
                    this.option("value", Math.max(Math.min(newValue, max), min))
                }
            },
            _startHandler: function(args) {
                var e = args.jQueryEvent;
                this._currentRatio = (ui.events.eventData(e).x - this._$bar.offset().left) / this._$bar.width();
                if (this.option("rtlEnabled"))
                    this._currentRatio = 1 - this._currentRatio;
                this._saveValueChangeEvent(e);
                this._changeValueOnSwipe(this._currentRatio)
            },
            _renderValue: function() {
                this.callBase();
                this._activeHandle().dxSliderHandle("option", "value", this.option("value"))
            },
            _rangeAnimationCompleteHandler: function() {
                this._fitHandleTooltipPosition()
            },
            _fitHandleTooltipPosition: function() {
                if (this._activeHandle())
                    this._activeHandle().dxSliderHandle("fitTooltipPosition")
            },
            _repaintHandle: function() {
                this._$handle.dxSliderHandle("repaint")
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"visible":
                        this.callBase(args);
                        this._renderHandle();
                        this._repaintHandle();
                        DX.utils.triggerShownEvent(this.element());
                        break;
                    case"min":
                    case"max":
                        this._renderLabels();
                        this._renderAriaMinAndMax();
                        this.callBase(args);
                        break;
                    case"step":
                        this._renderValue();
                        break;
                    case"keyStep":
                        break;
                    case"value":
                        this._updateHandleAriaLabel();
                        this.callBase(args);
                        break;
                    case"showRange":
                        this._renderRangeVisibility();
                        break;
                    case"tooltip":
                        this._renderHandle();
                        break;
                    case"label":
                        this._renderLabels();
                        break;
                    case"rtlEnabled":
                        this._toggleRTLDirection();
                        this._renderValue();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _refresh: function() {
                this._renderDimensions();
                this._renderValue();
                this._renderHandle();
                this._repaintHandle()
            }
        }));
        DX.registerComponent("dxSliderHandle", ui.dxSlider, dxSliderHandle)
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.rangeSlider.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var SLIDER_HANDLE_CLASS = "dx-slider-handle",
            RANGE_SLIDER_CLASS = "dx-rangeslider",
            RANGE_SLIDER_START_HANDLE_CLASS = RANGE_SLIDER_CLASS + "-start-handle",
            RANGE_SLIDER_END_HANDLE_CLASS = RANGE_SLIDER_CLASS + "-end-handle";
        DX.registerComponent("dxRangeSlider", ui, ui.dxSlider.inherit({
            _supportedKeys: function() {
                var isRTL = this.option("rtlEnabled");
                var that = this,
                    _changeHandle = function(e, capturedHandle) {
                        if (that.option("start") == that.option("end")) {
                            that._capturedHandle = capturedHandle;
                            e.target = that._capturedHandle;
                            that._capturedHandle.focus()
                        }
                    },
                    _setHandleValue = function(e, step, sign) {
                        var isStart = $(e.target).hasClass(RANGE_SLIDER_START_HANDLE_CLASS),
                            valueOption = isStart ? "start" : "end",
                            val = that.option(valueOption),
                            step = that._valueStep(step);
                        val += sign * (isRTL ? -step : step);
                        that.option(valueOption, val)
                    },
                    moveHandleRight = function(e, step) {
                        _changeHandle(e, isRTL ? that._$handleStart : that._$handleEnd);
                        _setHandleValue(e, step, 1)
                    },
                    moveHandleLeft = function(e, step) {
                        _changeHandle(e, isRTL ? that._$handleEnd : that._$handleStart);
                        _setHandleValue(e, step, -1)
                    };
                return $.extend(this.callBase(), {
                        leftArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleLeft(e, this.option("step"))
                        },
                        rightArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleRight(e, this.option("step"))
                        },
                        pageUp: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleRight(e, this.option("step") * this.option("keyStep"))
                        },
                        pageDown: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            moveHandleLeft(e, this.option("step") * this.option("keyStep"))
                        },
                        home: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var isStart = $(e.target).hasClass(RANGE_SLIDER_START_HANDLE_CLASS),
                                valueOption = isStart ? "start" : "end",
                                startOption = isStart ? "min" : "start",
                                val = this.option(startOption);
                            this.option(valueOption, val)
                        },
                        end: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var isStart = $(e.target).hasClass(RANGE_SLIDER_START_HANDLE_CLASS),
                                valueOption = isStart ? "start" : "end",
                                endOption = isStart ? "end" : "max",
                                val = this.option(endOption);
                            this.option(valueOption, val)
                        }
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    start: 40,
                    end: 60
                })
            },
            _render: function() {
                this.callBase();
                this.element().addClass(RANGE_SLIDER_CLASS)
            },
            _renderHandle: function() {
                this._$handleStart = this._renderHandleImpl(this.option("start"), this._$handleStart).addClass(RANGE_SLIDER_START_HANDLE_CLASS);
                this._$handleEnd = this._renderHandleImpl(this.option("end"), this._$handleEnd).addClass(RANGE_SLIDER_END_HANDLE_CLASS);
                this._updateHandleAriaLabels()
            },
            _startHandler: function(args) {
                var e = args.jQueryEvent,
                    $range = this._$range,
                    rangeWidth = $range.width(),
                    eventOffsetX = events.eventData(e).x - this._$bar.offset().left,
                    startHandleX = $range.position().left,
                    endHandleX = $range.position().left + rangeWidth,
                    rtlEnabled = this.option("rtlEnabled"),
                    startHandleIsClosest = (rtlEnabled ? -1 : 1) * ((startHandleX + endHandleX) / 2 - eventOffsetX) > 0;
                this._capturedHandle = startHandleIsClosest ? this._$handleStart : this._$handleEnd;
                this.callBase(args)
            },
            _updateHandleAriaLabels: function() {
                this.setAria("label", utils.stringFormat(Globalize.localize("dxRangeSlider-ariaFrom"), this.option("start")), this._$handleStart);
                this.setAria("label", utils.stringFormat(Globalize.localize("dxRangeSlider-ariaTill"), this.option("end")), this._$handleEnd)
            },
            _activeHandle: function() {
                return this._capturedHandle
            },
            _updateHandlePosition: function(e) {
                var rtlEnabled = this.option("rtlEnabled"),
                    offsetDirection = rtlEnabled ? -1 : 1,
                    max = this.option("max"),
                    min = this.option("min");
                var newRatio = this._startOffset + offsetDirection * e.jQueryEvent.offset / this._swipePixelRatio(),
                    newRatio = newRatio.toPrecision(12),
                    newValue = newRatio * (max - min) + min;
                this._updateSelectedRangePosition(newRatio, newRatio);
                this._changeValueOnSwipe(newRatio);
                var startValue = this.option("start"),
                    endValue = this.option("end"),
                    $nextHandle;
                if (startValue === endValue) {
                    if (newValue < startValue)
                        $nextHandle = this._$handleStart;
                    else
                        $nextHandle = this._$handleEnd;
                    $nextHandle.focus();
                    if ($nextHandle && $nextHandle !== this._capturedHandle) {
                        this._updateSelectedRangePosition((startValue - min) / (max - min), (endValue - min) / (max - min));
                        this._toggleActiveState(this._activeHandle(), false);
                        this._toggleActiveState($nextHandle, true);
                        this._capturedHandle = $nextHandle
                    }
                    this._updateSelectedRangePosition(newRatio, newRatio);
                    this._changeValueOnSwipe(newRatio)
                }
            },
            _updateSelectedRangePosition: function(leftRatio, rightRatio) {
                var rtlEnabled = this.option("rtlEnabled"),
                    moveRight = this._capturedHandle === this._$handleStart && rtlEnabled || this._capturedHandle === this._$handleEnd && !rtlEnabled;
                var prop = moveRight ? "right" : "left";
                if (rtlEnabled ^ moveRight)
                    this._$range.css(prop, 100 - rightRatio * 100 + "%");
                else
                    this._$range.css(prop, leftRatio * 100 + "%")
            },
            _changeValueOnSwipe: function(ratio) {
                this._suppressValueChangeAction();
                this.callBase(ratio);
                this._resumeValueChangeAction();
                var option = this._capturedHandle === this._$handleStart ? "start" : "end",
                    start = this.option("start"),
                    end = this.option("end"),
                    newValue = this.option("value"),
                    max = this.option("max"),
                    min = this.option("min");
                if (start > max) {
                    start = max;
                    this.option("start", max)
                }
                if (start < min) {
                    start = min;
                    this.option("start", min)
                }
                if (end > max) {
                    end = max;
                    this.option("end", max)
                }
                if (newValue > end && option === "start")
                    newValue = end;
                if (newValue < start && option === "end")
                    newValue = start;
                this.option(option, newValue)
            },
            _renderValue: function() {
                var valStart = this.option("start"),
                    valEnd = this.option("end"),
                    min = this.option("min"),
                    max = this.option("max"),
                    rtlEnabled = this.option("rtlEnabled");
                valStart = Math.max(min, Math.min(valStart, max));
                valEnd = Math.max(valStart, Math.min(valEnd, max));
                this.option("start", valStart);
                this.option("end", valEnd);
                var ratio1 = max === min ? 0 : (valStart - min) / (max - min),
                    ratio2 = max === min ? 0 : (valEnd - min) / (max - min);
                var startOffset = parseFloat((ratio1 * 100).toPrecision(12)) + "%",
                    endOffset = parseFloat(((1 - ratio2) * 100).toPrecision(12)) + "%";
                this._animateRange({
                    right: rtlEnabled ? startOffset : endOffset,
                    left: rtlEnabled ? endOffset : startOffset
                });
                this._renderHandle()
            },
            _repaintHandle: function() {
                this._$handleStart.dxSliderHandle("repaint");
                this._$handleEnd.dxSliderHandle("repaint")
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"start":
                    case"end":
                        this._renderValue();
                        this._createActionByOption("onValueChanged")({
                            start: this.option("start"),
                            end: this.option("end"),
                            jQueryEvent: this._valueChangeEventInstance
                        });
                        this._saveValueChangeEvent(undefined);
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.gallery.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator,
            GALLERY_CLASS = "dx-gallery",
            GALLERY_WRAPPER_CLASS = GALLERY_CLASS + "-wrapper",
            GALLERY_LOOP_CLASS = "dx-gallery-loop",
            GALLERY_ITEM_CONTAINER_CLASS = GALLERY_CLASS + "-container",
            GALLERY_ACTIVE_CLASS = GALLERY_CLASS + "-active",
            GALLERY_ITEM_CLASS = GALLERY_CLASS + "-item",
            GALLERY_LOOP_ITEM_CLASS = GALLERY_ITEM_CLASS + "-loop",
            GALLERY_ITEM_SELECTOR = "." + GALLERY_ITEM_CLASS,
            GALLERY_ITEM_SELECTED_CLASS = GALLERY_ITEM_CLASS + "-selected",
            GALLERY_INDICATOR_CLASS = GALLERY_CLASS + "-indicator",
            GALLERY_INDICATOR_ITEM_CLASS = GALLERY_INDICATOR_CLASS + "-item",
            GALLERY_INDICATOR_ITEM_SELECTOR = "." + GALLERY_INDICATOR_ITEM_CLASS,
            GALLERY_INDICATOR_ITEM_SELECTED_CLASS = GALLERY_INDICATOR_ITEM_CLASS + "-selected",
            GALLERY_ITEM_DATA_KEY = "dxGalleryItemData";
        var dxGalleryNavButton = ui.Widget.inherit({
                _supportedKeys: function() {
                    return $.extend(this.callBase(), {
                            pageUp: $.noop,
                            pageDown: $.noop
                        })
                },
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        direction: "next",
                        onClick: null,
                        hoverStateEnabled: true,
                        activeStateEnabled: true
                    })
                },
                _render: function() {
                    this.callBase();
                    var that = this,
                        $element = this.element(),
                        eventName = events.addNamespace("dxclick", this.NAME);
                    $element.addClass(GALLERY_CLASS + "-nav-button-" + this.option("direction")).off(eventName).on(eventName, function(e) {
                        that._createActionByOption("onClick")({jQueryEvent: e})
                    })
                },
                _optionChanged: function(args) {
                    switch (args.name) {
                        case"onClick":
                        case"direction":
                            this._invalidate();
                            break;
                        default:
                            this.callBase(args)
                    }
                }
            });
        DX.registerComponent("dxGallery", ui, ui.CollectionWidget.inherit({
            _activeStateUnit: GALLERY_ITEM_SELECTOR,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    activeStateEnabled: false,
                    animationDuration: 400,
                    animationEnabled: true,
                    loop: false,
                    swipeEnabled: true,
                    indicatorEnabled: true,
                    showIndicator: true,
                    selectedIndex: 0,
                    slideshowDelay: 0,
                    showNavButtons: false,
                    wrapAround: false,
                    initialItemWidth: undefined,
                    stretchImages: false,
                    loopItemFocus: false,
                    selectOnFocus: true,
                    selectionMode: "single",
                    selectionRequired: true,
                    selectionByClick: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this.option("loopItemFocus", this.option("loop"))
            },
            _dataSourceOptions: function() {
                return {paginate: false}
            },
            _itemContainer: function() {
                return this._$container
            },
            _itemClass: function() {
                return GALLERY_ITEM_CLASS
            },
            _itemDataKey: function() {
                return GALLERY_ITEM_DATA_KEY
            },
            _itemWidth: function() {
                if (!this._itemWidthCache)
                    this._itemWidthCache = this.option("initialItemWidth") || this.element().outerWidth();
                return this._itemWidthCache
            },
            _actualItemWidth: function() {
                var itemPerPage = this.option("wrapAround") ? this._itemsPerPage() + 1 : this._itemsPerPage();
                if (this.option("stretchImages"))
                    return this.element().outerWidth() / itemPerPage;
                if (this.option("wrapAround"))
                    return this._itemWidth() * this._itemsPerPage() / (this._itemsPerPage() + 1);
                return this._itemWidth()
            },
            _itemsPerPage: function() {
                var itemsPerPage = Math.floor(this.element().outerWidth() / this._itemWidth()) || 1;
                return Math.min(itemsPerPage, this._itemsCount())
            },
            _pagesCount: function() {
                return Math.ceil(this._itemsCount() / this._itemsPerPage())
            },
            _clearItemWidthCache: function() {
                delete this._itemWidthCache
            },
            _itemsCount: function() {
                return (this.option("items") || []).length
            },
            _offsetDirection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _render: function() {
                this.element().addClass(GALLERY_CLASS);
                this.element().toggleClass(GALLERY_LOOP_CLASS, this.option("loop"));
                this._renderDragHandler();
                this._renderWrapper();
                this._renderItemsContainer();
                this.callBase();
                this._renderContainerPosition();
                this._renderItemSizes();
                this._renderItemPositions();
                this._renderNavButtons();
                this._renderIndicator();
                this._renderSelectedItem();
                this._renderUserInteraction();
                this._setupSlideShow();
                this._reviseDimensions();
                this.setAria({
                    role: "listbox",
                    label: "gallery"
                })
            },
            itemAttributes: function() {
                return {role: "option"}
            },
            _dimensionChanged: function() {
                var selectedIndex = this.option("selectedIndex") || 0;
                this._clearItemWidthCache();
                this._renderDuplicateItems();
                this._renderItemSizes();
                this._renderItemPositions();
                this._renderIndicator();
                this._renderContainerPosition(this._calculateIndexOffset(selectedIndex))
            },
            _renderDragHandler: function() {
                var eventName = events.addNamespace("dragstart", this.NAME);
                this.element().off(eventName).on(eventName, "img", function() {
                    return false
                })
            },
            _renderWrapper: function() {
                if (this._$wrapper)
                    return;
                this._$wrapper = $("<div />").addClass(GALLERY_WRAPPER_CLASS).appendTo(this.element())
            },
            _renderItems: function(items) {
                this.callBase(items);
                this._loadNextPageIfNeeded()
            },
            _renderItemsContainer: function() {
                if (this._$container)
                    return;
                this._$container = $("<div>").addClass(GALLERY_ITEM_CONTAINER_CLASS).appendTo(this._$wrapper)
            },
            _renderDuplicateItems: function() {
                if (!this.option("loop"))
                    return;
                var items = this.option("items") || [],
                    itemsCount = items.length,
                    lastItemIndex = itemsCount - 1;
                if (!itemsCount)
                    return;
                this.element().find("." + GALLERY_LOOP_ITEM_CLASS).remove();
                var duplicateCount = Math.min(this._itemsPerPage(), itemsCount);
                for (var i = 0; i < duplicateCount; i++)
                    this._renderItem(0, items[i]).addClass(GALLERY_LOOP_ITEM_CLASS);
                for (var i = 0; i < duplicateCount; i++)
                    this._renderItem(0, items[lastItemIndex - i]).addClass(GALLERY_LOOP_ITEM_CLASS)
            },
            _renderItemSizes: function(startIndex) {
                var $items = this._itemElements(),
                    itemWidth = this._actualItemWidth();
                if (startIndex !== undefined)
                    $items = $items.slice(startIndex);
                $items.each(function(index) {
                    $($items[index]).outerWidth(itemWidth)
                })
            },
            _renderItemPositions: function() {
                var itemWidth = this._actualItemWidth(),
                    itemsCount = this._itemsCount(),
                    itemsPerPage = this._itemsPerPage(),
                    loopItemsCount = this.element().find("." + GALLERY_LOOP_ITEM_CLASS).length,
                    lastItemDuplicateIndex = itemsCount + loopItemsCount - 1,
                    offsetDirection = this._offsetDirection(),
                    offsetRatio = this.option("wrapAround") ? 0.5 : 0,
                    freeSpace = this._itemFreeSpace();
                this._itemElements().each(function(index) {
                    var realIndex = index;
                    if (index > itemsCount + itemsPerPage - 1)
                        realIndex = lastItemDuplicateIndex - realIndex - itemsPerPage;
                    var itemPosition = offsetDirection * itemWidth * (realIndex + offsetRatio) + freeSpace * (realIndex + 1 - offsetRatio);
                    translator.move($(this), {left: itemPosition})
                });
                this._relocateItems(this.option("selectedIndex"), this.option("selectedIndex"), true)
            },
            _itemFreeSpace: function() {
                var itemsPerPage = this._itemsPerPage();
                if (this.option("wrapAround"))
                    itemsPerPage = itemsPerPage + 1;
                return (this.element().outerWidth() - this._actualItemWidth() * itemsPerPage) / (itemsPerPage + 1)
            },
            _renderContainerPosition: function(offset, animate) {
                offset = offset || 0;
                var that = this,
                    itemWidth = this._actualItemWidth(),
                    targetIndex = offset,
                    targetPosition = this._offsetDirection() * targetIndex * (itemWidth + this._itemFreeSpace()),
                    positionReady;
                if (DX.utils.isDefined(this._animationOverride)) {
                    animate = this._animationOverride;
                    delete this._animationOverride
                }
                if (animate) {
                    that._startSwipe();
                    positionReady = that._animate(targetPosition).done($.proxy(that._endSwipe, that))
                }
                else {
                    translator.move(this._$container, {left: targetPosition});
                    positionReady = $.Deferred().resolveWith(that)
                }
                if (this._deferredAnimate)
                    positionReady.done(function() {
                        that._deferredAnimate.resolveWith(that)
                    });
                return positionReady.promise()
            },
            _startSwipe: function() {
                this.element().addClass(GALLERY_ACTIVE_CLASS)
            },
            _endSwipe: function() {
                this.element().removeClass(GALLERY_ACTIVE_CLASS)
            },
            _animate: function(targetPosition, extraConfig) {
                var that = this,
                    animationComplete = $.Deferred();
                fx.animate(this._$container, $.extend({
                    type: "slide",
                    to: {left: targetPosition},
                    duration: that.option("animationDuration"),
                    complete: function() {
                        if (that._needMoveContainerForward())
                            translator.move(that._$container, {left: 0});
                        if (that._needMoveContainerBack())
                            translator.move(that._$container, {left: that._maxContainerOffset()});
                        animationComplete.resolveWith(that)
                    }
                }, extraConfig || {}));
                return animationComplete
            },
            _needMoveContainerForward: function() {
                return this._$container.position().left * this._offsetDirection() <= -this._actualItemWidth() * this._itemsCount()
            },
            _needMoveContainerBack: function() {
                return this._$container.position().left * this._offsetDirection() >= this._actualItemWidth()
            },
            _maxContainerOffset: function() {
                return -(this._actualItemWidth() + this._itemFreeSpace()) * (this._itemsCount() - this._itemsPerPage()) * this._offsetDirection()
            },
            _reviseDimensions: function() {
                var that = this,
                    $firstItem = that._itemElements().first().find(".dx-item-content");
                if (!$firstItem || $firstItem.is(":hidden"))
                    return;
                if (!that.option("height"))
                    that.option("height", $firstItem.outerHeight());
                if (!that.option("width"))
                    that.option("width", $firstItem.outerWidth());
                this._dimensionChanged()
            },
            _renderIndicator: function() {
                this._cleanIndicators();
                if (!this.option("showIndicator"))
                    return;
                var indicator = this._$indicator = $("<div>").addClass(GALLERY_INDICATOR_CLASS).appendTo(this._$wrapper);
                for (var i = 0; i < this._pagesCount(); i++)
                    $("<div>").addClass(GALLERY_INDICATOR_ITEM_CLASS).appendTo(indicator);
                this._renderSelectedPageIndicator()
            },
            _cleanIndicators: function() {
                if (this._$indicator)
                    this._$indicator.remove()
            },
            _renderSelectedItem: function() {
                var selectedIndex = this.option("selectedIndex");
                this._itemElements().removeClass(GALLERY_ITEM_SELECTED_CLASS).eq(selectedIndex).addClass(GALLERY_ITEM_SELECTED_CLASS)
            },
            _renderSelectedPageIndicator: function() {
                if (!this._$indicator)
                    return;
                var itemIndex = this.option("selectedIndex"),
                    lastIndex = this._pagesCount() - 1,
                    pageIndex = Math.ceil(itemIndex / this._itemsPerPage());
                pageIndex = Math.min(lastIndex, pageIndex);
                this._$indicator.find(GALLERY_INDICATOR_ITEM_SELECTOR).removeClass(GALLERY_INDICATOR_ITEM_SELECTED_CLASS).eq(pageIndex).addClass(GALLERY_INDICATOR_ITEM_SELECTED_CLASS)
            },
            _renderUserInteraction: function() {
                var that = this,
                    rootElement = that.element(),
                    swipeEnabled = that.option("swipeEnabled") && this._itemsCount() > 1,
                    cursor = swipeEnabled ? "pointer" : "default";
                this._createComponent(rootElement, "dxSwipeable", {
                    disabled: this.option("disabled") || !swipeEnabled,
                    onStart: $.proxy(that._swipeStartHandler, that),
                    onUpdated: $.proxy(that._swipeUpdateHandler, that),
                    onEnd: $.proxy(that._swipeEndHandler, that),
                    itemSizeFunc: $.proxy(that._actualItemWidth(), that)
                });
                var indicatorSelectAction = this._createAction(this._indicatorSelectHandler);
                rootElement.off(events.addNamespace("dxclick", this.NAME), GALLERY_INDICATOR_ITEM_SELECTOR).on(events.addNamespace("dxclick", this.NAME), GALLERY_INDICATOR_ITEM_SELECTOR, function(e) {
                    indicatorSelectAction({jQueryEvent: e})
                })
            },
            _indicatorSelectHandler: function(args) {
                var e = args.jQueryEvent,
                    instance = args.component;
                if (!instance.option("indicatorEnabled"))
                    return;
                var indicatorIndex = $(e.target).index(),
                    itemIndex = instance._fitPaginatedIndex(indicatorIndex * instance._itemsPerPage());
                instance._needLongMove = true;
                instance.option("selectedIndex", itemIndex);
                instance._loadNextPageIfNeeded(itemIndex)
            },
            _renderNavButtons: function() {
                var that = this,
                    selectedIndex;
                if (!that.option("showNavButtons")) {
                    that._cleanNavButtons();
                    return
                }
                that._prevNavButton = $("<div>").appendTo(this._$wrapper);
                that._createComponent(that._prevNavButton, "dxGalleryNavButton", {
                    direction: "prev",
                    onClick: function() {
                        that._prevPage()
                    }
                });
                that._nextNavButton = $("<div>").appendTo(this._$wrapper);
                that._createComponent(that._nextNavButton, "dxGalleryNavButton", {
                    direction: "next",
                    onClick: function() {
                        that._nextPage()
                    }
                });
                this._renderNavButtonsVisibility()
            },
            _prevPage: function() {
                var visiblePageSize = this._itemsPerPage(),
                    newSelectedIndex = this.option("selectedIndex") - visiblePageSize;
                if (newSelectedIndex === -visiblePageSize && visiblePageSize === this._itemsCount())
                    return this._relocateItems(newSelectedIndex, 0);
                else
                    return this.goToItem(this._fitPaginatedIndex(newSelectedIndex))
            },
            _nextPage: function() {
                var visiblePageSize = this._itemsPerPage(),
                    newSelectedIndex = this.option("selectedIndex") + visiblePageSize;
                if (newSelectedIndex === visiblePageSize && visiblePageSize === this._itemsCount())
                    return this._relocateItems(newSelectedIndex, 0);
                else
                    return this.goToItem(this._fitPaginatedIndex(newSelectedIndex)).done(this._loadNextPageIfNeeded)
            },
            _loadNextPageIfNeeded: function(selectedIndex) {
                var selectedIndex = selectedIndex === undefined ? this.option("selectedIndex") : selectedIndex;
                if (this._dataSource && this._dataSource.paginate() && this._shouldLoadNextPage(selectedIndex) && !this._isDataSourceLoading() && !this._isLastPage())
                    this._loadNextPage().done($.proxy(function() {
                        this._renderIndicator();
                        this._renderItemPositions();
                        this._renderNavButtonsVisibility();
                        this._renderItemSizes(selectedIndex)
                    }, this))
            },
            _shouldLoadNextPage: function(selectedIndex) {
                var visiblePageSize = this._itemsPerPage();
                return selectedIndex + 2 * visiblePageSize > this.option("items").length
            },
            _allowDinamicItemsAppend: function() {
                return true
            },
            _fitPaginatedIndex: function(itemIndex) {
                var itemsPerPage = this._itemsPerPage();
                var restItemsCount = itemIndex < 0 ? itemsPerPage + itemIndex : this._itemsCount() - itemIndex;
                if (itemIndex > this._itemsCount() - 1) {
                    itemIndex = 0;
                    this._goToGhostItem = true
                }
                else if (restItemsCount < itemsPerPage && restItemsCount > 0)
                    if (itemIndex > 0)
                        itemIndex = itemIndex - (itemsPerPage - restItemsCount);
                    else
                        itemIndex = itemIndex + (itemsPerPage - restItemsCount);
                return itemIndex
            },
            _cleanNavButtons: function() {
                if (this._prevNavButton) {
                    this._prevNavButton.remove();
                    delete this._prevNavButton
                }
                if (this._nextNavButton) {
                    this._nextNavButton.remove();
                    delete this._nextNavButton
                }
            },
            _renderNavButtonsVisibility: function() {
                if (!this.option("showNavButtons") || !this._prevNavButton || !this._nextNavButton)
                    return;
                var selectedIndex = this.option("selectedIndex"),
                    loop = this.option("loop"),
                    itemsCount = this._itemsCount();
                this._prevNavButton.show();
                this._nextNavButton.show();
                if (loop)
                    return;
                var nextHidden = selectedIndex === itemsCount - this._itemsPerPage(),
                    prevHidden = itemsCount < 2 || selectedIndex === 0;
                if (this._dataSource && this._dataSource.paginate())
                    nextHidden = nextHidden && this._isLastPage();
                else
                    nextHidden = nextHidden || itemsCount < 2;
                if (prevHidden)
                    this._prevNavButton.hide();
                if (nextHidden)
                    this._nextNavButton.hide()
            },
            _setupSlideShow: function() {
                var that = this,
                    slideshowDelay = that.option("slideshowDelay");
                clearTimeout(that._slideshowTimer);
                if (!slideshowDelay)
                    return;
                that._slideshowTimer = setTimeout(function() {
                    if (that._userInteraction) {
                        that._setupSlideShow();
                        return
                    }
                    that.nextItem(true).done(that._setupSlideShow)
                }, slideshowDelay)
            },
            _swipeStartHandler: function(e) {
                var itemsCount = this._itemsCount();
                if (!itemsCount) {
                    e.jQueryEvent.cancel = true;
                    return
                }
                this._stopItemAnimations();
                this._startSwipe();
                this._userInteraction = true;
                if (!this.option("loop")) {
                    var selectedIndex = this.option("selectedIndex"),
                        startOffset = itemsCount - selectedIndex - this._itemsPerPage(),
                        endOffset = selectedIndex,
                        rtlEnabled = this.option("rtlEnabled");
                    e.jQueryEvent.maxLeftOffset = rtlEnabled ? endOffset : startOffset;
                    e.jQueryEvent.maxRightOffset = rtlEnabled ? startOffset : endOffset
                }
            },
            _stopItemAnimations: function() {
                fx.stop(this._$container, true)
            },
            _swipeUpdateHandler: function(e) {
                var offset = this._offsetDirection() * e.jQueryEvent.offset * this._itemsPerPage() - this.option("selectedIndex");
                if (offset < 0)
                    this._loadNextPageIfNeeded(Math.ceil(Math.abs(offset)));
                this._renderContainerPosition(offset)
            },
            _swipeEndHandler: function(e) {
                var targetOffset = e.jQueryEvent.targetOffset * this._offsetDirection() * this._itemsPerPage(),
                    selectedIndex = this.option("selectedIndex"),
                    newIndex = this._fitIndex(selectedIndex - targetOffset),
                    paginatedIndex = this._fitPaginatedIndex(newIndex);
                if (Math.abs(targetOffset) < this._itemsPerPage()) {
                    this._relocateItems(selectedIndex);
                    return
                }
                if (this._itemsPerPage() == this._itemsCount()) {
                    if (targetOffset > 0)
                        this._relocateItems(-targetOffset);
                    else
                        this._relocateItems(0);
                    return
                }
                this.option("selectedIndex", paginatedIndex)
            },
            _setFocusOnSelect: function() {
                this._userInteraction = true;
                var selectedItem = this.itemElements().filter("." + GALLERY_ITEM_SELECTED_CLASS);
                this.option("focusedElement", selectedItem);
                this._userInteraction = false
            },
            _flipIndex: function(index) {
                var itemsCount = this._itemsCount();
                index = index % itemsCount;
                if (index > (itemsCount + 1) / 2)
                    index -= itemsCount;
                if (index < -(itemsCount - 1) / 2)
                    index += itemsCount;
                return index
            },
            _fitIndex: function(index) {
                if (!this.option("loop"))
                    return index;
                var itemsCount = this._itemsCount();
                if (index >= itemsCount || index < 0)
                    this._goToGhostItem = true;
                if (index >= itemsCount)
                    index = itemsCount - index;
                index = index % itemsCount;
                if (index < 0)
                    index += itemsCount;
                return index
            },
            _clean: function() {
                this.callBase();
                this._cleanIndicators();
                this._cleanNavButtons()
            },
            _dispose: function() {
                clearTimeout(this._slideshowTimer);
                this.callBase()
            },
            _updateSelection: function(addedSelection, removedSelection) {
                this._stopItemAnimations();
                this._renderNavButtonsVisibility();
                this._renderSelectedItem();
                this._relocateItems(addedSelection[0], removedSelection[0]);
                this._renderSelectedPageIndicator()
            },
            _relocateItems: function(newIndex, prevIndex, withoutAnimation) {
                if (prevIndex === undefined)
                    prevIndex = newIndex;
                var indexOffset = this._calculateIndexOffset(newIndex, prevIndex);
                this._renderContainerPosition(indexOffset, this.option("animationEnabled") && !withoutAnimation).done(function() {
                    this._setFocusOnSelect();
                    this._userInteraction = false;
                    this._setupSlideShow()
                })
            },
            _focusInHandler: function(e) {
                if (fx.isAnimating(this._$container) || this._userInteraction)
                    return;
                this.callBase.apply(this, arguments)
            },
            _focusOutHandler: function(e) {
                if (fx.isAnimating(this._$container) || this._userInteraction)
                    return;
                this.callBase.apply(this, arguments)
            },
            _selectFocusedItem: $.noop,
            _moveFocus: function(location) {
                this._stopItemAnimations();
                this.callBase.apply(this, arguments);
                var index = this.itemElements().index(this.option("focusedElement"));
                this.goToItem(index, this.option("animationEnabled"))
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._reviseDimensions()
            },
            _calculateIndexOffset: function(newIndex, lastIndex) {
                if (lastIndex === undefined)
                    lastIndex = newIndex;
                var maxIndex = this._itemsCount() - 1;
                var indexOffset = lastIndex - newIndex;
                if (this.option("loop") && !this._needLongMove && this._goToGhostItem) {
                    if (this._isItemOnFirstPage(newIndex) && this._isItemOnLastPage(lastIndex))
                        indexOffset = -this._itemsPerPage();
                    else if (this._isItemOnLastPage(newIndex) && this._isItemOnFirstPage(lastIndex))
                        indexOffset = this._itemsPerPage();
                    this._goToGhostItem = false
                }
                this._needLongMove = false;
                indexOffset = indexOffset - lastIndex;
                return indexOffset
            },
            _isItemOnLastPage: function(itemIndex) {
                return itemIndex >= this._itemsCount() - this._itemsPerPage()
            },
            _isItemOnFirstPage: function(itemIndex) {
                return itemIndex <= this._itemsPerPage()
            },
            _optionChanged: function(args) {
                var value = args.value;
                switch (args.name) {
                    case"width":
                    case"initialItemWidth":
                        this.callBase.apply(this, arguments);
                        this._dimensionChanged();
                        break;
                    case"animationDuration":
                        this._renderNavButtonsVisibility();
                        break;
                    case"animationEnabled":
                        break;
                    case"loop":
                        this.option("loopItemFocus", value);
                        this.element().toggleClass(GALLERY_LOOP_CLASS, value);
                        this._renderDuplicateItems();
                        this._renderItemPositions();
                        this._renderNavButtonsVisibility();
                        return;
                    case"showIndicator":
                        this._renderIndicator();
                        return;
                    case"showNavButtons":
                        this._renderNavButtons();
                        return;
                    case"slideshowDelay":
                        this._setupSlideShow();
                        return;
                    case"wrapAround":
                    case"stretchImages":
                        this._renderItemSizes();
                        this._renderItemPositions();
                        break;
                    case"swipeEnabled":
                    case"indicatorEnabled":
                        this._renderUserInteraction();
                        return;
                    default:
                        this.callBase(args)
                }
            },
            goToItem: function(itemIndex, animation) {
                var selectedIndex = this.option("selectedIndex"),
                    itemsCount = this._itemsCount();
                if (animation !== undefined)
                    this._animationOverride = animation;
                itemIndex = this._fitIndex(itemIndex);
                this._deferredAnimate = $.Deferred();
                if (itemIndex > itemsCount - 1 || itemIndex < 0 || selectedIndex === itemIndex)
                    return this._deferredAnimate.resolveWith(this).promise();
                this.option("selectedIndex", itemIndex);
                return this._deferredAnimate.promise()
            },
            prevItem: function(animation) {
                return this.goToItem(this.option("selectedIndex") - 1, animation)
            },
            nextItem: function(animation) {
                return this.goToItem(this.option("selectedIndex") + 1, animation)
            }
        }));
        DX.registerComponent("dxGalleryNavButton", ui.dxGallery, dxGalleryNavButton)
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.overlay.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            fx = DX.fx,
            translator = DX.translator;
        var OVERLAY_CLASS = "dx-overlay",
            OVERLAY_WRAPPER_CLASS = "dx-overlay-wrapper",
            OVERLAY_CONTENT_CLASS = "dx-overlay-content",
            OVERLAY_SHADER_CLASS = "dx-overlay-shader",
            OVERLAY_MODAL_CLASS = "dx-overlay-modal",
            ANONYMOUS_TEMPLATE_NAME = "content",
            RTL_DIRECTION_CLASS = "dx-rtl",
            ACTIONS = ["onShowing", "onShown", "onHiding", "onHidden", "onPositioning", "onPositioned"],
            FIRST_Z_INDEX = 1000,
            Z_INDEX_STACK = [],
            DISABLED_STATE_CLASS = "dx-state-disabled",
            TAB_KEY = 9;
        var realDevice = DX.devices.real(),
            realVersion = realDevice.version,
            iOS7_0andBelow = realDevice.platform === "ios" && (realVersion[0] < 7 || realVersion[0] == 7 && realVersion[1] == 0),
            android4_0nativeBrowser = realDevice.platform === "android" && realVersion[0] == 4 && realVersion[1] == 0 && navigator.userAgent.indexOf("Chrome") === -1;
        var forceRepaint = function($element) {
                if (iOS7_0andBelow)
                    $element.width();
                if (android4_0nativeBrowser) {
                    var $parents = $element.parents(),
                        inScrollView = $parents.is(".dx-scrollable-native");
                    if (!inScrollView) {
                        $parents.css("backface-visibility", "hidden");
                        $parents.css("backface-visibility");
                        $parents.css("backface-visibility", "visible")
                    }
                }
            };
        var getElement = function(value) {
                return value && $(value instanceof $.Event ? value.target : value)
            };
        DX.registerComponent("dxOverlay", ui, ui.Widget.inherit({
            _supportedKeys: function() {
                var offsetSize = 5,
                    parent = this.callBase(),
                    move = function(top, left, e) {
                        if (!this.option("dragEnabled"))
                            return;
                        e.preventDefault();
                        e.stopPropagation();
                        var offset = {
                                top: top,
                                left: left
                            };
                        this._changePosition(offset)
                    };
                return $.extend(this.callBase(), {
                        escape: function(e) {
                            this.hide()
                        },
                        downArrow: $.proxy(move, this, offsetSize, 0),
                        upArrow: $.proxy(move, this, -offsetSize, 0),
                        leftArrow: $.proxy(move, this, 0, -offsetSize),
                        rightArrow: $.proxy(move, this, 0, offsetSize)
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    shownAction: {
                        since: "14.2",
                        alias: "onShown"
                    },
                    showingAction: {
                        since: "14.2",
                        alias: "onShowing"
                    },
                    hidingAction: {
                        since: "14.2",
                        alias: "onHiding"
                    },
                    hiddenAction: {
                        since: "14.2",
                        alias: "onHidden"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    activeStateEnabled: false,
                    visible: false,
                    deferRendering: true,
                    shading: true,
                    shadingColor: "",
                    position: {
                        my: "center",
                        at: "center"
                    },
                    width: function() {
                        return $(window).width() * 0.8
                    },
                    height: function() {
                        return $(window).height() * 0.8
                    },
                    animation: {
                        show: {
                            type: "pop",
                            duration: 400
                        },
                        hide: {
                            type: "pop",
                            duration: 400,
                            to: {
                                opacity: 0,
                                scale: 0
                            },
                            from: {
                                opacity: 1,
                                scale: 1
                            }
                        }
                    },
                    closeOnOutsideClick: false,
                    closeOnBackButton: true,
                    onShowing: null,
                    onShown: null,
                    onHiding: null,
                    onHidden: null,
                    contentTemplate: "content",
                    dragEnabled: false,
                    resizeEnabled: false,
                    target: undefined,
                    container: undefined,
                    hideTopOverlayHandler: undefined,
                    closeOnTargetScroll: false,
                    onPositioning: null,
                    onPositioned: null,
                    boundaryOffset: {
                        h: 0,
                        v: 0
                    }
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                var realDevice = DX.devices.real(),
                                    realPlatform = realDevice.platform,
                                    realVersion = realDevice.version;
                                return realPlatform === "android" && (realVersion[0] < 4 || realVersion[0] == 4 && realVersion[1] <= 1)
                            },
                            options: {animation: {
                                    show: {
                                        type: "fade",
                                        duration: 400
                                    },
                                    hide: {
                                        type: "fade",
                                        duration: 400,
                                        to: {opacity: 0},
                                        from: {opacity: 1}
                                    }
                                }}
                        }])
            },
            _setOptionsByReference: function() {
                this.callBase();
                $.extend(this._optionsByReference, {animation: true})
            },
            _getAnonimousTemplateName: function() {
                return ANONYMOUS_TEMPLATE_NAME
            },
            _wrapper: function() {
                return this._$wrapper
            },
            _container: function() {
                return this._$content
            },
            _init: function() {
                this.callBase();
                this._initActions();
                this._initCloseOnOutsideClickHandler();
                this._$wrapper = $("<div>").addClass(OVERLAY_WRAPPER_CLASS);
                this._$content = $("<div>").addClass(OVERLAY_CONTENT_CLASS);
                var $element = this.element();
                this._$wrapper.addClass($element.attr("class"));
                $element.addClass(OVERLAY_CLASS);
                this._$wrapper.attr("data-bind", "dxControlsDescendantBindings: true");
                this._$wrapper.on("MSPointerDown", $.noop);
                this._toggleViewPortSubscriptiion(true)
            },
            _initOptions: function(options) {
                this._initTarget(options.target);
                this._initContainer(options.container);
                this._initHideTopOverlayHandler(options.hideTopOverlayHandler);
                this.callBase(options)
            },
            _initTarget: function(target) {
                if (!utils.isDefined(target))
                    return;
                var options = this.option();
                $.each(["position.of", "animation.show.from.position.of", "animation.show.to.position.of", "animation.hide.from.position.of", "animation.hide.to.position.of"], function(_, path) {
                    var pathParts = path.split(".");
                    var option = options;
                    while (option)
                        if (pathParts.length == 1) {
                            if ($.isPlainObject(option))
                                option[pathParts.shift()] = target;
                            break
                        }
                        else
                            option = option[pathParts.shift()]
                })
            },
            _initContainer: function(container) {
                container = container === undefined ? DX.viewPort() : container;
                var $element = this.element(),
                    $container = $element.closest(container);
                if (!$container.length)
                    $container = $(container).first();
                this._$container = $container.length ? $container : $element.parent()
            },
            _initHideTopOverlayHandler: function(handler) {
                this._hideTopOverlayHandler = handler !== undefined ? handler : $.proxy(this._defaultHideTopOverlayHandler, this)
            },
            _defaultHideTopOverlayHandler: function() {
                this.hide()
            },
            _initActions: function() {
                this._actions = {};
                $.each(ACTIONS, $.proxy(function(_, action) {
                    this._actions[action] = this._createActionByOption(action) || $.noop
                }, this))
            },
            _initCloseOnOutsideClickHandler: function() {
                this._proxiedDocumentDownHandler = $.proxy(function() {
                    this._documentDownHandler.apply(this, arguments)
                }, this)
            },
            _documentDownHandler: function(e) {
                if (!this._isTopOverlay())
                    return;
                var closeOnOutsideClick = this.option("closeOnOutsideClick");
                if ($.isFunction(closeOnOutsideClick))
                    closeOnOutsideClick = closeOnOutsideClick(e);
                if (closeOnOutsideClick) {
                    var $container = this._$content,
                        outsideClick = !$container.is(e.target) && !$.contains($container.get(0), e.target);
                    if (outsideClick) {
                        if (this.option("shading"))
                            e.preventDefault();
                        this.hide()
                    }
                }
            },
            _isTopOverlay: function() {
                var zIndexStack = this._zIndexStack();
                return zIndexStack[zIndexStack.length - 1] === this._zIndex
            },
            _zIndexStack: function() {
                return Z_INDEX_STACK
            },
            _zIndexInitValue: function() {
                return FIRST_Z_INDEX
            },
            _toggleViewPortSubscriptiion: function(toggle) {
                DX.viewPortChanged.remove(this._viewPortChangeHandle);
                if (toggle) {
                    this._viewPortChangeHandle = $.proxy(this._viewPortChangeHandler, this);
                    DX.viewPortChanged.add(this._viewPortChangeHandle)
                }
            },
            _viewPortChangeHandler: function() {
                this._initContainer(this.option("container"));
                this._refresh()
            },
            _renderVisibilityAnimate: function() {
                var visible = this.option("visible");
                this._stopAnimation();
                if (visible)
                    return this._show();
                else
                    return this._hide()
            },
            _normalizePosition: function() {
                this._position = this.option("position")
            },
            _show: function() {
                if (this._isParentHidden())
                    return $.Deferred().resolve();
                this._normalizePosition();
                var that = this,
                    deferred = $.Deferred(),
                    animation = that.option("animation") || {},
                    showAnimation = this._normalizeAnimation(animation.show, "to"),
                    completeShowAnimation = showAnimation && showAnimation.complete || $.noop;
                if (this._isHidingActionCancelled) {
                    delete this._isHidingActionCancelled;
                    deferred.resolve()
                }
                else {
                    this._toggleVisibility(true);
                    this._animate(showAnimation, function() {
                        if (that.option("focusStateEnabled"))
                            that._focusTarget().focus();
                        completeShowAnimation.apply(this, arguments);
                        that._actions.onShown();
                        deferred.resolve()
                    })
                }
                return deferred.promise()
            },
            _normalizeAnimation: function(animation, prop) {
                if (animation && animation[prop]) {
                    animation = $.extend({type: "slide"}, animation);
                    $.extend(animation[prop], {position: this._position})
                }
                return animation
            },
            _hide: function() {
                var that = this,
                    deferred = $.Deferred(),
                    animation = this.option("animation") || {},
                    hideAnimation = this._normalizeAnimation(animation.hide, "from"),
                    completeHideAnimation = hideAnimation && hideAnimation.complete || $.noop,
                    hidingArgs = {cancel: false};
                this._actions.onHiding(hidingArgs);
                if (hidingArgs.cancel) {
                    this._isHidingActionCancelled = true;
                    this.option("visible", true);
                    deferred.resolve()
                }
                else {
                    this._toggleShading(false);
                    this._animate(hideAnimation, function() {
                        that._toggleVisibility(false);
                        completeHideAnimation.apply(this, arguments);
                        that._actions.onHidden();
                        deferred.resolve()
                    })
                }
                return deferred.promise()
            },
            _animate: function(animation, completeCallback) {
                if (animation) {
                    var startCallback = animation.start || $.noop,
                        $content = this._$content;
                    fx.animate(this._$content, $.extend({}, animation, {
                        start: function() {
                            $content.css("pointer-events", "none");
                            startCallback.apply(this, arguments)
                        },
                        complete: function() {
                            $content.css("pointer-events", "");
                            completeCallback.apply(this, arguments)
                        }
                    }))
                }
                else
                    completeCallback()
            },
            _stopAnimation: function() {
                fx.stop(this._$content, true)
            },
            _toggleVisibility: function(visible) {
                if (visible && this._isParentHidden())
                    return;
                this._stopAnimation();
                if (!visible)
                    utils.triggerHidingEvent(this._$content);
                this.callBase.apply(this, arguments);
                this._$content.toggle(visible);
                this._updateZIndexStackPosition(visible);
                if (visible) {
                    this._renderContent();
                    this._actions.onShowing();
                    this._moveToContainer();
                    this._renderGeometry();
                    utils.triggerShownEvent(this._$content)
                }
                else
                    this._moveFromContainer();
                this._toggleShading(visible);
                this._toggleSubscriptions(visible)
            },
            _updateZIndexStackPosition: function(pushToStack) {
                var zIndexStack = this._zIndexStack();
                if (pushToStack) {
                    if (!this._zIndex) {
                        var length = zIndexStack.length;
                        this._zIndex = (length ? zIndexStack[length - 1] : this._zIndexInitValue()) + 1;
                        zIndexStack.push(this._zIndex)
                    }
                    this._$wrapper.css("z-index", this._zIndex);
                    this._$content.css("z-index", this._zIndex)
                }
                else if (this._zIndex) {
                    var index = $.inArray(this._zIndex, zIndexStack);
                    zIndexStack.splice(index, 1);
                    delete this._zIndex
                }
            },
            _toggleShading: function(visible) {
                this._$wrapper.toggleClass(OVERLAY_MODAL_CLASS, this.option("shading") && !this.option("container"));
                this._$wrapper.toggleClass(OVERLAY_SHADER_CLASS, visible && this.option("shading"));
                this._$wrapper.css("background-color", this.option("shading") ? this.option("shadingColor") : "");
                this._toggleTabTerminator(visible && this.option("shading"))
            },
            _toggleTabTerminator: function(enabled) {
                var eventName = events.addNamespace("keydown", this.NAME);
                if (enabled)
                    $(document).on(eventName, $.proxy(this._tabKeyHandler, this));
                else
                    $(document).off(eventName)
            },
            _tabKeyHandler: function(e) {
                if (e.keyCode !== TAB_KEY)
                    return;
                var tabbableElements = this._$wrapper.find(":dx-tabbable"),
                    $firstTabbable = tabbableElements.first(),
                    $lastTabbable = tabbableElements.last(),
                    isTabOnLast = !e.shiftKey && e.target === $lastTabbable.get(0),
                    isShiftTabOnFirst = e.shiftKey && e.target === $firstTabbable.get(0),
                    isEmptyTabList = tabbableElements.length === 0,
                    isOutsideTarget = $.inArray(e.target, tabbableElements) === -1;
                if (isTabOnLast || isShiftTabOnFirst || isEmptyTabList || isOutsideTarget) {
                    e.preventDefault();
                    (e.shiftKey ? $lastTabbable : $firstTabbable).focusin().focus()
                }
            },
            _toggleSubscriptions: function(enabled) {
                this._toggleHideTopOverlayCallback(enabled);
                this._toggleDocumentDownHandler(enabled);
                this._toggleParentsScrollSubscription(enabled)
            },
            _toggleHideTopOverlayCallback: function(subscribe) {
                if (!this._hideTopOverlayHandler)
                    return;
                if (subscribe && this.option("closeOnBackButton"))
                    DX.hideTopOverlayCallback.add(this._hideTopOverlayHandler);
                else
                    DX.hideTopOverlayCallback.remove(this._hideTopOverlayHandler)
            },
            _toggleDocumentDownHandler: function(enabled) {
                var eventName = events.addNamespace("dxpointerdown", this.NAME);
                if (enabled)
                    $(document).on(eventName, this._proxiedDocumentDownHandler);
                else
                    $(document).off(eventName, this._proxiedDocumentDownHandler)
            },
            _toggleParentsScrollSubscription: function(subscribe) {
                if (!this._position)
                    return;
                var that = this,
                    target = that._position.of || $(),
                    closeOnScroll = this.option("closeOnTargetScroll"),
                    $parents = getElement(target).parents();
                if (DX.devices.real().platform == "generic")
                    $parents = $parents.add(window);
                $().add(this._$prevTargetParents).off(events.addNamespace("scroll dxscroll", that.NAME));
                if (subscribe && closeOnScroll) {
                    $parents.on(events.addNamespace("scroll dxscroll", that.NAME), function(e) {
                        if (e.overlayProcessed)
                            return;
                        e.overlayProcessed = true;
                        var closeHandled = false;
                        if ($.isFunction(closeOnScroll))
                            closeHandled = closeOnScroll(e);
                        if (!closeHandled)
                            that.hide()
                    });
                    this._$prevTargetParents = $parents
                }
            },
            _renderContent: function() {
                var shouldDeferRendering = !this.option("visible") && this.option("deferRendering");
                var isParentHidden = this.option("visible") && this._isParentHidden();
                if (this._contentAlreadyRendered || shouldDeferRendering || isParentHidden)
                    return;
                this._contentAlreadyRendered = true;
                this.callBase()
            },
            _isParentHidden: function() {
                var $parent = this.element().parent();
                if ($parent.is(":visible"))
                    return false;
                var isHidden = false;
                $parent.add($parent.parents()).each(function() {
                    var $element = $(this);
                    if ($element.css("display") === "none") {
                        isHidden = true;
                        return false
                    }
                });
                return isHidden || !$.contains(document, $parent.get(0))
            },
            _renderContentImpl: function() {
                var $element = this.element();
                this._$content.appendTo($element);
                var contentTemplate = this._getTemplate(this.option("contentTemplate"));
                contentTemplate && contentTemplate.render(this.content());
                this._renderDrag();
                this._renderResize();
                this._renderScrollTerminator()
            },
            _renderDrag: function() {
                var $dragTarget = this._getDragTarget();
                if (!$dragTarget)
                    return;
                var startEventName = events.addNamespace("dxdragstart", this.NAME),
                    updateEventName = events.addNamespace("dxdrag", this.NAME);
                $dragTarget.off(startEventName).off(updateEventName);
                if (!this.option("dragEnabled"))
                    return;
                $dragTarget.on(startEventName, $.proxy(this._dragStartHandler, this)).on(updateEventName, $.proxy(this._dragUpdateHandler, this))
            },
            _renderResize: function() {
                this._createComponent(this._$content, "dxResizable", {
                    handles: this.option("resizeEnabled") ? "all" : "none",
                    onResizeEnd: $.proxy(this._resizeEndHandler, this),
                    minHeight: 100,
                    minWidth: 100,
                    area: this._$container
                })
            },
            _resizeEndHandler: function() {
                this._geometryChangeHandled = true
            },
            _renderScrollTerminator: function() {
                var $scrollTerminator = this._wrapper();
                var scrollEventName = events.addNamespace("dxscroll", this.NAME);
                $scrollTerminator.off(scrollEventName).on(scrollEventName, {
                    validate: function() {
                        return true
                    },
                    getDirection: function() {
                        return "both"
                    },
                    _togglePointerAddons: $.noop,
                    _clearSelection: $.noop,
                    isNative: true
                }, function(e) {
                    if (e.originalEvent.originalEvent.type !== "mousemove")
                        e.preventDefault()
                })
            },
            _getDragTarget: function() {
                return this.content()
            },
            _dragStartHandler: function(e) {
                e.targetElements = [];
                this._prevOffset = {
                    x: 0,
                    y: 0
                };
                var position = translator.locate(this._$content),
                    allowedOffsets = this._allowedOffsets();
                var deltaSize = this._deltaSize();
                var isAllowedDrag = deltaSize.height >= 0 && deltaSize.width >= 0;
                this._geometryChangeHandled = isAllowedDrag;
                e.maxLeftOffset = isAllowedDrag ? position.left + allowedOffsets.left : 0;
                e.maxRightOffset = isAllowedDrag ? -position.left + allowedOffsets.right : 0;
                e.maxTopOffset = isAllowedDrag ? position.top + allowedOffsets.top : 0;
                e.maxBottomOffset = isAllowedDrag ? -position.top + allowedOffsets.bottom : 0
            },
            _deltaSize: function() {
                var $content = this._$content,
                    $container = this._$container;
                var contentWidth = $content.outerWidth(),
                    contentHeight = $content.outerHeight(),
                    containerWidth = $container.width(),
                    containerHeight = $container.height();
                return {
                        width: containerWidth - contentWidth,
                        height: containerHeight - contentHeight
                    }
            },
            _dragUpdateHandler: function(e) {
                var offset = e.offset,
                    prevOffset = this._prevOffset,
                    targetOffset = {
                        top: offset.y - prevOffset.y,
                        left: offset.x - prevOffset.x
                    };
                this._changePosition(targetOffset);
                this._prevOffset = offset
            },
            _changePosition: function(offset) {
                var position = translator.locate(this._$content);
                translator.move(this._$content, {
                    left: position.left + offset.left,
                    top: position.top + offset.top
                })
            },
            _allowedOffsets: function() {
                var deltaSize = this._deltaSize(),
                    boundaryOffset = this.option("boundaryOffset");
                return {
                        top: boundaryOffset.v,
                        bottom: deltaSize.height - boundaryOffset.v,
                        left: boundaryOffset.h,
                        right: deltaSize.width - boundaryOffset.h
                    }
            },
            _fireContentReadyAction: function() {
                if (this.option("visible"))
                    this._moveToContainer();
                this.callBase.apply(this, arguments)
            },
            _moveFromContainer: function() {
                this._$content.appendTo(this.element());
                this._detachWrapperToContainer()
            },
            _detachWrapperToContainer: function() {
                this._$wrapper.detach()
            },
            _moveToContainer: function() {
                this._attachWrapperToContainer();
                this._$content.appendTo(this._$wrapper)
            },
            _attachWrapperToContainer: function() {
                var $element = this.element();
                if (this._$container && !(this._$container[0] === $element.parent()[0]))
                    this._$wrapper.appendTo(this._$container);
                else
                    this._$wrapper.appendTo($element)
            },
            _renderGeometry: function() {
                if (this.option("visible"))
                    this._renderGeometryImpl()
            },
            _renderGeometryImpl: function() {
                this._stopAnimation();
                this._normalizePosition();
                this._renderShading();
                this._renderDimensions();
                this._renderPosition()
            },
            _renderShading: function() {
                var $wrapper = this._$wrapper,
                    $container = this._getContainer();
                $wrapper.css("position", this._isWindow($container) ? "fixed" : "absolute");
                if (this.option("shading"))
                    $wrapper.show();
                this._renderShadingDimensions();
                this._renderShadingPosition()
            },
            _renderShadingPosition: function() {
                if (this.option("shading")) {
                    var $container = this._getContainer();
                    DX.position(this._$wrapper, {
                        my: "top left",
                        at: "top left",
                        of: $container
                    })
                }
            },
            _renderShadingDimensions: function() {
                if (this.option("shading")) {
                    var $container = this._getContainer(),
                        wrapperWidth = this._isWindow($container) ? "100%" : $container.outerWidth(),
                        wrapperHeight = this._isWindow($container) ? "100%" : $container.outerHeight();
                    this._$wrapper.css({
                        width: wrapperWidth,
                        height: wrapperHeight
                    })
                }
            },
            _isWindow: function($element) {
                return !!$element && $.isWindow($element.get(0))
            },
            _getContainer: function() {
                var position = this._position,
                    container = this.option("container"),
                    positionOf = position ? position.of || window : null;
                return getElement(container || positionOf)
            },
            _renderDimensions: function() {
                if (this._geometryChangeHandled) {
                    var $content = this._$content,
                        $container = this._$container;
                    $content.outerWidth(Math.min($content.outerWidth(), $container.width())).outerHeight(Math.min($content.outerHeight(), $container.height()))
                }
                else
                    this._$content.outerWidth(this.option("width")).outerHeight(this.option("height"))
            },
            _renderPosition: function() {
                if (this._geometryChangeHandled) {
                    var $content = this._$content,
                        position = translator.locate($content),
                        allowedOffsets = this._allowedOffsets();
                    translator.move($content, {
                        top: utils.fitIntoRange(position.top, -allowedOffsets.top, allowedOffsets.bottom),
                        left: utils.fitIntoRange(position.left, -allowedOffsets.left, allowedOffsets.right)
                    })
                }
                else {
                    translator.resetPosition(this._$content);
                    this._renderOverlayBoundaryOffset();
                    var position = this._position,
                        containerPosition = DX.calculatePosition(this._$content, position);
                    this._actions.onPositioning({position: containerPosition});
                    var resultPosition = DX.position(this._$content, containerPosition);
                    this._actions.onPositioned({position: resultPosition});
                    forceRepaint(this._$content)
                }
            },
            _renderOverlayBoundaryOffset: function() {
                var boundaryOffset = this.option("boundaryOffset");
                this._$content.css("margin", boundaryOffset.v + "px " + boundaryOffset.h + "px")
            },
            _focusTarget: function() {
                return this._$content
            },
            _attachKeyboardEvents: function() {
                this._keyboardProcessor = new ui.KeyboardProcessor({
                    element: this._$content,
                    handler: this._keyboardHandler,
                    context: this
                })
            },
            _keyboardHandler: function(options) {
                var e = options.originalEvent,
                    $target = $(e.target);
                if ($target.is(this._$content))
                    this.callBase.apply(this, arguments)
            },
            _visibilityChanged: function(visible) {
                if (visible) {
                    if (this.option("visible") && this._$content.is(":hidden"))
                        this._show();
                    this._dimensionChanged()
                }
                else if (this._$content.is(":visible"))
                    this._hide()
            },
            _dimensionChanged: function() {
                this._renderGeometry()
            },
            _clean: function() {
                this._cleanFocusState()
            },
            _dispose: function() {
                this._stopAnimation();
                this._toggleViewPortSubscriptiion(false);
                this._toggleSubscriptions(false);
                this._updateZIndexStackPosition(false);
                this._actions = null;
                this.callBase();
                this._$wrapper.remove();
                this._$content.remove()
            },
            _toggleDisabledState: function(value) {
                this.callBase.apply(this, arguments);
                this._$content.toggleClass(DISABLED_STATE_CLASS, value)
            },
            _toggleRTLDirection: function(rtl) {
                this._$content.toggleClass(RTL_DIRECTION_CLASS, rtl)
            },
            _optionChanged: function(args) {
                var value = args.value;
                if ($.inArray(args.name, ACTIONS) > -1) {
                    this._initActions();
                    return
                }
                switch (args.name) {
                    case"dragEnabled":
                        this._renderDrag();
                        break;
                    case"resizeEnabled":
                        this._renderResize();
                        break;
                    case"resizeEnabled":
                        this._invalidate();
                        break;
                    case"shading":
                    case"shadingColor":
                        this._toggleShading(this.option("visible"));
                        break;
                    case"width":
                    case"height":
                    case"position":
                    case"boundaryOffset":
                        this._renderGeometry();
                        break;
                    case"visible":
                        delete this._geometryChangeHandled;
                        this._renderVisibilityAnimate().done($.proxy(function() {
                            if (!this._animateDeferred)
                                return;
                            this._animateDeferred.resolveWith(this)
                        }, this));
                        break;
                    case"target":
                        this._initTarget(value);
                        this._invalidate();
                        break;
                    case"container":
                        this._initContainer(value);
                        this._invalidate();
                        break;
                    case"deferRendering":
                    case"contentTemplate":
                        this._invalidate();
                        break;
                    case"closeOnBackButton":
                        this._toggleHideTopOverlayCallback(this.option("visible"));
                        break;
                    case"closeOnOutsideClick":
                        this._toggleDocumentDownHandler(this.option("visible"));
                        break;
                    case"closeOnTargetScroll":
                        this._toggleParentsScrollSubscription(this.option("visible"));
                        break;
                    case"animation":
                        break;
                    default:
                        this.callBase(args)
                }
            },
            toggle: function(showing) {
                showing = showing === undefined ? !this.option("visible") : showing;
                if (showing === this.option("visible"))
                    return $.Deferred().resolve().promise();
                var animateDeferred = $.Deferred();
                this._animateDeferred = animateDeferred;
                this.option("visible", showing);
                return animateDeferred.promise().done($.proxy(function() {
                        delete this._animateDeferred
                    }, this))
            },
            show: function() {
                return this.toggle(true)
            },
            hide: function() {
                return this.toggle(false)
            },
            content: function() {
                return this._$content
            },
            repaint: function() {
                this._renderGeometry()
            }
        }));
        DevExpress.ui.dxOverlay.baseZIndex = function(zIndex) {
            FIRST_Z_INDEX = zIndex
        };
        ui.dxOverlay.__internals = {
            OVERLAY_CLASS: OVERLAY_CLASS,
            OVERLAY_WRAPPER_CLASS: OVERLAY_WRAPPER_CLASS,
            OVERLAY_CONTENT_CLASS: OVERLAY_CONTENT_CLASS,
            OVERLAY_SHADER_CLASS: OVERLAY_SHADER_CLASS,
            OVERLAY_MODAL_CLASS: OVERLAY_MODAL_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.toast.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var TOAST_CLASS = "dx-toast",
            TOAST_CLASS_PREFIX = TOAST_CLASS + "-",
            TOAST_WRAPPER_CLASS = TOAST_CLASS_PREFIX + "wrapper",
            TOAST_CONTENT_CLASS = TOAST_CLASS_PREFIX + "content",
            TOAST_MESSAGE_CLASS = TOAST_CLASS_PREFIX + "message",
            TOAST_ICON_CLASS = TOAST_CLASS_PREFIX + "icon",
            WIDGET_NAME = "dxToast",
            toastTypes = ["info", "warning", "error", "success"],
            Z_INDEX_STACK = [],
            FIRST_Z_INDEX_OFFSET = 8000,
            visibleToastInstance = null,
            POSITION_ALIASES = {
                top: {
                    my: "top",
                    at: "top",
                    of: window,
                    offset: "0 0"
                },
                bottom: {
                    my: "bottom",
                    at: "bottom",
                    of: window,
                    offset: "0 -20"
                },
                center: {
                    my: "center",
                    at: "center",
                    of: window,
                    offset: "0 0"
                },
                right: {
                    my: "center right",
                    at: "center right",
                    of: window,
                    offset: "0 0"
                },
                left: {
                    my: "center left",
                    at: "center left",
                    of: window,
                    offset: "0 0"
                }
            };
        DX.registerComponent(WIDGET_NAME, ui, ui.dxOverlay.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    message: "",
                    type: "info",
                    displayTime: 2000,
                    position: "bottom center",
                    animation: {
                        show: {
                            type: "fade",
                            duration: 400,
                            from: 0,
                            to: 1
                        },
                        hide: {
                            type: "fade",
                            duration: 400,
                            to: 0
                        }
                    },
                    shading: false,
                    height: "auto",
                    closeOnBackButton: false,
                    resizeEnabled: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {
                                position: "top center",
                                width: function() {
                                    return $(window).width()
                                }
                            }
                        }, {
                            device: function(device) {
                                return device.platform == "android"
                            },
                            options: {
                                closeOnOutsideClick: true,
                                width: "auto",
                                position: {
                                    at: "bottom left",
                                    my: "bottom left",
                                    offset: "20 -20"
                                }
                            }
                        }, {
                            device: function(device) {
                                return device.deviceType == "phone" && device.platform == "android"
                            },
                            options: {
                                width: function() {
                                    return $(window).width()
                                },
                                position: {
                                    at: "bottom center",
                                    my: "bottom center",
                                    offset: "0 0"
                                }
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this._posStringToObject()
            },
            _renderContentImpl: function() {
                if (this.option("message"))
                    this._message = $("<div>").addClass(TOAST_MESSAGE_CLASS).text(this.option("message")).appendTo(this.content());
                this.setAria("role", "alert", this._message);
                if ($.inArray(this.option("type").toLowerCase(), toastTypes) > -1)
                    this.content().prepend($("<div>").addClass(TOAST_ICON_CLASS));
                this.callBase()
            },
            _render: function() {
                this.callBase();
                this.element().addClass(TOAST_CLASS);
                this._wrapper().addClass(TOAST_WRAPPER_CLASS);
                this._$content.addClass(TOAST_CLASS_PREFIX + String(this.option("type")).toLowerCase());
                this.content().addClass(TOAST_CONTENT_CLASS);
                this._$content.off("dxswipe").on("dxswipe", $.proxy(this.hide, this))
            },
            _posStringToObject: function() {
                if (!DX.utils.isString(this.option("position")))
                    return;
                var verticalPosition = this.option("position").split(" ")[0],
                    horizontalPosition = this.option("position").split(" ")[1];
                this.option("position", $.extend({}, POSITION_ALIASES[verticalPosition]));
                switch (horizontalPosition) {
                    case"center":
                    case"left":
                    case"right":
                        this.option("position").at += " " + horizontalPosition;
                        this.option("position").my += " " + horizontalPosition;
                        break
                }
            },
            _show: function() {
                if (visibleToastInstance) {
                    clearTimeout(visibleToastInstance._hideTimeout);
                    visibleToastInstance.hide()
                }
                visibleToastInstance = this;
                return this.callBase.apply(this, arguments).done($.proxy(function() {
                        clearTimeout(this._hideTimeout);
                        this._hideTimeout = setTimeout($.proxy(this.hide, this), this.option("displayTime"))
                    }, this))
            },
            _hide: function() {
                visibleToastInstance = null;
                return this.callBase.apply(this, arguments)
            },
            _zIndexStack: function() {
                return Z_INDEX_STACK
            },
            _zIndexInitValue: function() {
                return this.callBase() + FIRST_Z_INDEX_OFFSET
            },
            _dispose: function() {
                clearTimeout(this._hideTimeout);
                visibleToastInstance = null;
                this.callBase()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"type":
                        this._$content.removeClass(TOAST_CLASS_PREFIX + args.previousValue);
                        this._$content.addClass(TOAST_CLASS_PREFIX + String(args.value).toLowerCase());
                        break;
                    case"message":
                        if (this._message)
                            this._message.text(args.value);
                        break;
                    case"displayTime":
                    case"position":
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }));
        ui.dxToast.__internals = {
            TOAST_CLASS: TOAST_CLASS,
            TOAST_WRAPPER_CLASS: TOAST_WRAPPER_CLASS,
            TOAST_CONTENT_CLASS: TOAST_CONTENT_CLASS,
            TOAST_MESSAGE_CLASS: TOAST_MESSAGE_CLASS,
            TOAST_ICON_CLASS: TOAST_ICON_CLASS,
            TOAST_CLASS_PREFIX: TOAST_CLASS_PREFIX,
            WIDGET_NAME: WIDGET_NAME
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.popup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            translator = DX.translator,
            POPUP_CLASS = "dx-popup",
            POPUP_WRAPPER_CLASS = "dx-popup-wrapper",
            POPUP_FULL_SCREEN_CLASS = "dx-popup-fullscreen",
            POPUP_CONTENT_CLASS = "dx-popup-content",
            POPUP_DRAGGABLE_CLASS = "dx-popup-draggable",
            POPUP_TITLE_CLASS = "dx-popup-title",
            POPUP_TITLE_CLOSEBUTTON_CLASS = "dx-closebutton",
            POPUP_TITLE_HAS_BUTTON_CLASS = "dx-popup-title-has-button",
            POPUP_BOTTOM_CLASS = "dx-popup-bottom",
            TEMPLATE_WRAPPER_CLASS = "dx-template-wrapper",
            ALLOWED_BUTTON_ALIASES = ["cancel", "clear", "done"];
        var getButtonPlace = function(name) {
                var device = DX.devices.current(),
                    platform = device.platform,
                    toolbar = "bottom",
                    location = "before";
                if (platform === "ios")
                    switch (name) {
                        case"cancel":
                            toolbar = "top";
                            break;
                        case"clear":
                            toolbar = "top";
                            location = "after";
                            break;
                        case"done":
                            location = "after";
                            break
                    }
                else if (platform === "win8")
                    location = "after";
                else if (platform === "android" && device.version && parseInt(device.version[0]) > 4)
                    switch (name) {
                        case"cancel":
                            location = "after";
                            break;
                        case"done":
                            location = "after";
                            break
                    }
                else if (platform === "android")
                    location = "center";
                return {
                        toolbar: toolbar,
                        location: location
                    }
            };
        DX.registerComponent("dxPopup", ui, ui.dxOverlay.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    fullScreen: false,
                    title: "",
                    showTitle: true,
                    titleTemplate: "title",
                    onTitleRendered: null,
                    dragEnabled: false,
                    buttons: [],
                    showCloseButton: false,
                    bottomTemplate: "bottom"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {width: function() {
                                    return $(window).width()
                                }}
                        }, {
                            device: {
                                platform: "win8",
                                phone: true
                            },
                            options: {position: {
                                    my: "top center",
                                    at: "top center",
                                    offset: "0 0"
                                }}
                        }, {
                            device: {platform: "ios"},
                            options: {animation: this._iosAnimation}
                        }, {
                            device: {platform: "generic"},
                            options: {showCloseButton: true}
                        }, {
                            device: function(device) {
                                return DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {dragEnabled: true}
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }])
            },
            _iosAnimation: {
                show: {
                    type: "slide",
                    duration: 400,
                    from: {position: {
                            my: "top",
                            at: "bottom"
                        }},
                    to: {position: {
                            my: "center",
                            at: "center"
                        }}
                },
                hide: {
                    type: "slide",
                    duration: 400,
                    from: {
                        opacity: 1,
                        position: {
                            my: "center",
                            at: "center"
                        }
                    },
                    to: {
                        opacity: 1,
                        position: {
                            my: "top",
                            at: "bottom"
                        }
                    }
                }
            },
            _init: function() {
                this.callBase();
                this.element().addClass(POPUP_CLASS);
                this._wrapper().addClass(POPUP_WRAPPER_CLASS);
                this._$popupContent = this._$content.wrapInner($("<div>").addClass(POPUP_CONTENT_CLASS)).children().eq(0)
            },
            _render: function() {
                this._$content.toggleClass(POPUP_DRAGGABLE_CLASS, this.option("dragEnabled")).toggleClass(POPUP_FULL_SCREEN_CLASS, this.option("fullScreen"));
                this.callBase()
            },
            _renderContentImpl: function() {
                this.callBase();
                this._renderTitle();
                this._renderBottom()
            },
            _renderTitle: function() {
                var items = this._getToolbarItems("top"),
                    titleText = this.option("title"),
                    showTitle = this.option("showTitle");
                if (showTitle && !!titleText)
                    items.unshift({
                        location: DX.devices.current().ios ? "center" : "before",
                        text: titleText
                    });
                if (showTitle || items.length > 0) {
                    this._$title && this._$title.remove();
                    var $title = $("<div>").addClass(POPUP_TITLE_CLASS).prependTo(this._$content);
                    this._$title = this._renderTemplateByType("titleTemplate", items, $title).addClass(POPUP_TITLE_CLASS);
                    this._renderDrag();
                    this._executeTitleRenderAction(this._$title)
                }
                else if (this._$title)
                    this._$title.detach()
            },
            _renderTemplateByType: function(optionName, data, $container) {
                var template = this._getTemplateByOption(optionName),
                    toolbarTemplate = template.owner() === this.option("templateProvider");
                if (toolbarTemplate) {
                    var $result = template.render(data, $container);
                    $container.replaceWith($result);
                    return $result
                }
                else {
                    var $result = template.render($container);
                    if ($result.hasClass(TEMPLATE_WRAPPER_CLASS)) {
                        $container.replaceWith($result);
                        $container = $result
                    }
                    return $container
                }
            },
            _executeTitleRenderAction: function(titleElement) {
                this._getTitleRenderAction()({titleElement: titleElement})
            },
            _getTitleRenderAction: function() {
                return this._titleRenderAction || this._createTitleRenderAction()
            },
            _createTitleRenderAction: function() {
                return this._titleRenderAction = this._createActionByOption("onTitleRendered", {
                        element: this.element(),
                        excludeValidators: ["designMode", "disabled", "readOnly"]
                    })
            },
            _getCloseButton: function() {
                return {
                        toolbar: "top",
                        location: "after",
                        template: this._getCloseButtonRenderer()
                    }
            },
            _getCloseButtonRenderer: function() {
                return $.proxy(function(_, __, $container) {
                        var $button = $("<div>").addClass(POPUP_TITLE_CLOSEBUTTON_CLASS);
                        this._createComponent($button, "dxButton", {
                            icon: 'close',
                            onClick: this._createButtonAction(undefined)
                        });
                        $container.append($button)
                    }, this)
            },
            _getToolbarItems: function(toolbar) {
                var buttons = this.option("buttons");
                var toolbarsItems = [];
                this._buttonsClasses = [];
                var currentPlatform = DX.devices.current().platform,
                    index = 0;
                $.each(buttons, $.proxy(function(_, data) {
                    var isShortcut = DX.utils.isDefined(data.shortcut),
                        item = isShortcut ? getButtonPlace(data.shortcut) : data;
                    if (isShortcut && currentPlatform === "ios" && index < 2) {
                        item.toolbar = "top";
                        index++
                    }
                    $.extend(item, DX.utils.isDefined(data.toolbar) ? {toolbar: data.toolbar} : {});
                    if (item && item.toolbar === toolbar) {
                        if (isShortcut)
                            $.extend(item, {location: data.location}, this._getButtonByAlias(data));
                        var isLTROrder = currentPlatform === "win8" || currentPlatform === "generic";
                        if (data.shortcut === "done" && isLTROrder || data.shortcut === "cancel" && !isLTROrder)
                            toolbarsItems.unshift(item);
                        else
                            toolbarsItems.push(item)
                    }
                }, this));
                if (toolbar === "top" && this.option("showCloseButton"))
                    toolbarsItems.push(this._getCloseButton());
                return toolbarsItems
            },
            _getButtonByAlias: function(data) {
                var buttonType = data.shortcut;
                if ($.inArray(buttonType, ALLOWED_BUTTON_ALIASES) < 0)
                    return false;
                var buttonConfig = $.extend({
                        text: Globalize.localize(DX.inflector.camelize(buttonType, true)),
                        onClick: this._createButtonAction(data.onClick)
                    }, data.options || {});
                var buttonClass = POPUP_CLASS + "-" + buttonType;
                this._buttonsClasses.push(buttonClass);
                var $button = $("<div>").addClass(buttonClass);
                this._createComponent($button, "dxButton", buttonConfig);
                return {template: function(_, __, $container) {
                            $container.append($button)
                        }}
            },
            _createButtonAction: function(clickAction) {
                return this._createAction(clickAction, {afterExecute: function(e) {
                            e.component.hide()
                        }})
            },
            _renderBottom: function() {
                var items = this._getToolbarItems("bottom");
                if (items.length) {
                    this._$bottom && this._$bottom.remove();
                    var $bottom = $("<div>").addClass(POPUP_BOTTOM_CLASS).appendTo(this._$content);
                    this._$bottom = this._renderTemplateByType("bottomTemplate", items, $bottom).addClass(POPUP_BOTTOM_CLASS);
                    this._toggleClasses()
                }
                else
                    this._$bottom && this._$bottom.detach()
            },
            _toggleClasses: function() {
                var aliases = ALLOWED_BUTTON_ALIASES;
                $.each(aliases, $.proxy(function(_, alias) {
                    var className = POPUP_CLASS + "-" + alias;
                    if ($.inArray(className, this._buttonsClasses) >= 0) {
                        this._wrapper().addClass(className + "-visible");
                        this._$bottom.addClass(className)
                    }
                    else {
                        this._wrapper().removeClass(className + "-visible");
                        this._$bottom.removeClass(className)
                    }
                }, this))
            },
            _getDragTarget: function() {
                return this._$title
            },
            _renderGeometryImpl: function() {
                this._resetContentHeight();
                this.callBase.apply(this, arguments);
                this._setContentHeight()
            },
            _resetContentHeight: function() {
                this._$popupContent.css({
                    height: "auto",
                    "max-height": "none"
                })
            },
            _renderResize: function() {
                this.callBase();
                this._$content.dxResizable("option", "onResize", $.proxy(this._setContentHeight, this))
            },
            _setContentHeight: function() {
                if (!this._$popupContent)
                    return;
                var contentHeight = this._$content.height();
                if (this._$title)
                    contentHeight -= this._$title.outerHeight(true) || 0;
                if (this._$bottom)
                    contentHeight -= this._$bottom.outerHeight(true) || 0;
                this._$popupContent.css({
                    height: "100%",
                    "max-height": contentHeight
                })
            },
            _renderDimensions: function() {
                if (this.option("fullScreen"))
                    this._$content.css({
                        width: "100%",
                        height: "100%"
                    });
                else
                    this.callBase.apply(this, arguments)
            },
            _renderShadingDimensions: function() {
                if (this.option("fullScreen"))
                    this._wrapper().css({
                        width: "100%",
                        height: "100%"
                    });
                else
                    this.callBase.apply(this, arguments)
            },
            _renderPosition: function() {
                if (this.option("fullScreen"))
                    translator.move(this._$content, {
                        top: 0,
                        left: 0
                    });
                else
                    this.callBase.apply(this, arguments)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"showTitle":
                    case"title":
                    case"titleTemplate":
                        this._renderTitle();
                        this._setContentHeight();
                        break;
                    case"bottomTemplate":
                        this._renderBottom();
                        this._setContentHeight();
                        break;
                    case"onTitleRendered":
                        this._createTitleRenderAction(args.value);
                        break;
                    case"buttons":
                        this._renderTitle();
                        this._renderBottom();
                        this._setContentHeight();
                        break;
                    case"dragEnabled":
                        this._renderDrag();
                        break;
                    case"height":
                        this.callBase(args);
                        this._setContentHeight();
                        break;
                    case"fullScreen":
                        this._$content.toggleClass(POPUP_FULL_SCREEN_CLASS, args.value);
                        this._refresh();
                        break;
                    case"showCloseButton":
                        this._renderTitle();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            bottomToolbar: function() {
                return this._$bottom
            },
            content: function() {
                return this._$popupContent
            },
            overlayContent: function() {
                return this._$content
            }
        }));
        ui.dxPopup.__internals = {
            POPUP_CLASS: POPUP_CLASS,
            POPUP_WRAPPER_CLASS: POPUP_WRAPPER_CLASS,
            POPUP_CONTENT_CLASS: POPUP_CONTENT_CLASS,
            POPUP_FULL_SCREEN_CLASS: POPUP_FULL_SCREEN_CLASS,
            POPUP_TITLE_CLASS: POPUP_TITLE_CLASS,
            POPUP_BOTTOM_CLASS: POPUP_BOTTOM_CLASS,
            POPUP_TITLE_CLOSEBUTTON_CLASS: POPUP_TITLE_CLOSEBUTTON_CLASS,
            POPUP_TITLE_HAS_BUTTON_CLASS: POPUP_TITLE_HAS_BUTTON_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.popover.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx;
        var POPOVER_CLASS = "dx-popover",
            POPOVER_WRAPPER_CLASS = "dx-popover-wrapper",
            POPOVER_ARROW_CLASS = "dx-popover-arrow",
            POPOVER_WITHOUT_TITLE_CLASS = "dx-popover-without-title",
            POSITION_FLIP_MAP = {
                left: "right",
                top: "bottom",
                right: "left",
                bottom: "top"
            },
            POSITION_ALIASES = {
                top: {
                    my: "bottom center",
                    at: "top center"
                },
                bottom: {
                    my: "top center",
                    at: "bottom center"
                },
                right: {
                    my: "left center",
                    at: "right center"
                },
                left: {
                    my: "right center",
                    at: "left center"
                },
                topNone: {
                    my: "bottom center",
                    at: "top center",
                    collision: "none"
                },
                bottomNone: {
                    my: "top center",
                    at: "bottom center",
                    collision: "none"
                },
                rightNone: {
                    my: "left center",
                    at: "right center",
                    collision: "none"
                },
                leftNone: {
                    my: "right center",
                    at: "left center",
                    collision: "none"
                }
            },
            ARROW_OFFSET_CORRECTION = {
                top: "0 -1",
                bottom: "0 1",
                left: "-1 0",
                right: "1 0"
            };
        DX.registerComponent("dxPopover", ui, ui.dxPopup.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    target: window,
                    shading: false,
                    position: 'bottom',
                    closeOnOutsideClick: true,
                    animation: {
                        show: {
                            type: "fade",
                            from: 0,
                            to: 1
                        },
                        hide: {
                            type: "fade",
                            to: 0
                        }
                    },
                    showTitle: false,
                    width: "auto",
                    height: "auto",
                    dragEnabled: false,
                    resizeEnabled: false,
                    fullScreen: false,
                    closeOnTargetScroll: true,
                    arrowPosition: null,
                    boundaryOffset: {
                        h: 10,
                        v: 10
                    }
                })
            },
            _defaultOptionsRules: function() {
                return [{
                            device: {platform: "ios"},
                            options: {arrowPosition: {
                                    boundaryOffset: {
                                        h: 20,
                                        v: -10
                                    },
                                    collision: "fit"
                                }}
                        }]
            },
            _init: function() {
                this.callBase();
                this._renderArrow();
                this.element().addClass(POPOVER_CLASS);
                this._wrapper().addClass(POPOVER_WRAPPER_CLASS)
            },
            _renderArrow: function() {
                this._$arrow = $("<div>").addClass(POPOVER_ARROW_CLASS).appendTo(this._wrapper())
            },
            _documentDownHandler: function(e) {
                if (this._isOutsideClick(e))
                    this.callBase(e)
            },
            _isOutsideClick: function(e) {
                return !$(e.target).closest(this.option("target")).length
            },
            _animate: function(animation) {
                this._animateArrow(animation);
                if (animation && animation.to)
                    $.extend(animation.to, {position: this._contentPosition});
                this.callBase.apply(this, arguments)
            },
            _animateArrow: function(animation) {
                if (!animation)
                    return;
                DX.fx.animate(this._$arrow, $.extend({}, animation, {complete: $.noop}))
            },
            _stopAnimation: function() {
                this.callBase.apply(this, arguments);
                fx.stop(this._$arrow)
            },
            _renderTitle: function() {
                this._wrapper().toggleClass(POPOVER_WITHOUT_TITLE_CLASS, !this.option("showTitle"));
                this.callBase()
            },
            _renderPosition: function() {
                this.callBase();
                this._renderOverlayPosition();
                this._renderArrowPosition()
            },
            _renderOverlayBoundaryOffset: $.noop,
            _renderOverlayPosition: function() {
                this._setContentHeight(true);
                this._togglePositionClass("dx-position-" + this._positionSide);
                DX.translator.move(this._$content, {
                    left: 0,
                    top: 0
                });
                var contentPosition = $.extend({}, this._position);
                var containerPosition = this._getContainerPosition();
                var containerLocation = DX.calculatePosition(this._$content, containerPosition);
                var isFlippedByVertical = containerLocation.v.flip;
                var isFlippedByHorizontal = containerLocation.h.flip;
                this._updateContentSize(containerLocation);
                if (this._position.collision === "flip")
                    contentPosition.collision = "fit";
                var positionClass = "dx-position-" + (isFlippedByVertical || isFlippedByHorizontal ? POSITION_FLIP_MAP[this._positionSide] : this._positionSide);
                this._togglePositionClass(positionClass);
                this._toggleFlippedClass(isFlippedByVertical, isFlippedByHorizontal);
                $.extend(contentPosition, this._applyFlip(contentPosition, isFlippedByVertical, isFlippedByHorizontal));
                contentPosition.offset = this._updateContentOffset(isFlippedByVertical, isFlippedByHorizontal, contentPosition.offset);
                DX.position(this._$content, contentPosition);
                this._contentPosition = contentPosition
            },
            _setContentHeight: function(fullUpdate) {
                if (fullUpdate)
                    this.callBase()
            },
            _updateContentSize: function(containerLocation) {
                if (!this._$popupContent)
                    return;
                var positionAt = this._positionSide;
                if (containerLocation.h.oversize > 0 && (positionAt === "left" || positionAt === "right")) {
                    var newContainerWidth = this._$content.width() - containerLocation.h.oversize;
                    this._$content.width(newContainerWidth)
                }
                if (containerLocation.v.oversize > 0 && (positionAt === "top" || positionAt === "bottom")) {
                    var newOverlayContentHeight = this._$content.height() - containerLocation.v.oversize,
                        newPopupContentHeight = this._$popupContent.height() - containerLocation.v.oversize;
                    this._$content.height(newOverlayContentHeight);
                    this._$popupContent.height(newPopupContentHeight)
                }
            },
            _updateContentOffset: function(isFlippedByVertical, isFlippedByHorizontal, offsetString) {
                var position = this._positionSide,
                    offset = this._getOffsetObject(offsetString),
                    signCorrectionH = isFlippedByHorizontal ? -1 : 1,
                    signCorrectionV = isFlippedByVertical ? -1 : 1;
                var isTopPosition = position === "top" && !isFlippedByVertical || position === "bottom" && isFlippedByVertical,
                    isBottomPosition = position === "bottom" && !isFlippedByVertical || position === "top" && isFlippedByVertical,
                    isLeftPosition = position === "left" && !isFlippedByHorizontal || position === "right" && isFlippedByHorizontal,
                    isRightPosition = position === "right" && !isFlippedByHorizontal || position === "left" && isFlippedByHorizontal;
                if (isTopPosition)
                    return offset.h + " " + (offset.v * signCorrectionV - (this._$arrow.height() - 1));
                if (isBottomPosition)
                    return offset.h + " " + (offset.v * signCorrectionV + (this._$arrow.height() - 1));
                if (isLeftPosition)
                    return offset.h * signCorrectionH - (this._$arrow.width() - 1) + " " + offset.v;
                if (isRightPosition)
                    return offset.h * signCorrectionH + (this._$arrow.width() - 1) + " " + offset.v
            },
            _getContainerPosition: function() {
                var offset = this._getOffsetObject(this._position.offset || "");
                var arrowConsideredOffset = this._$arrow.width() + offset.h + " " + (this._$arrow.height() + offset.v);
                return $.extend({}, this._position, {offset: arrowConsideredOffset})
            },
            _applyFlip: function(position, isFlippedByVertical, isFlippedByHorizontal) {
                var pairMy = DX.utils.splitPair(position.my),
                    pairAt = DX.utils.splitPair(position.at);
                var isVertical = function(location) {
                        return location === "bottom" || location === "top"
                    };
                var isHorizontal = function(location) {
                        return location === "left" || location === "right"
                    };
                var flipIfNeeded = function(location) {
                        return isFlippedByVertical && isVertical(location) || isFlippedByHorizontal && isHorizontal(location) ? DX.position.inverseAlign(location) : location
                    };
                return {
                        my: flipIfNeeded(pairMy[0]) + " " + flipIfNeeded(pairMy[1]),
                        at: flipIfNeeded(pairAt[0]) + " " + flipIfNeeded(pairAt[1])
                    }
            },
            _renderArrowPosition: function() {
                DX.translator.move(this._$arrow, {
                    left: 0,
                    top: 0
                });
                var arrowPosition = this.option("arrowPosition"),
                    position = $.extend({}, this._getDefaultArrowPosition(), arrowPosition);
                var customPositionSpecified = arrowPosition && DX.utils.isDefined(arrowPosition.at) && DX.utils.isDefined(arrowPosition.my);
                if (customPositionSpecified)
                    $.extend(position, this._getCustomArrowPosition(arrowPosition));
                DX.position(this._$arrow, position)
            },
            _getCustomArrowPosition: function(arrowPosition) {
                var contentPositionAt = this._contentPosition.at.split(" ")[0],
                    arrowPositionAt = arrowPosition.at,
                    arrowPositionMy = arrowPosition.my,
                    isFlipped = arrowPositionAt && arrowPositionAt.split(" ")[0] === contentPositionAt;
                if (isFlipped) {
                    var at = arrowPositionAt;
                    arrowPositionAt = arrowPositionMy;
                    arrowPositionMy = at
                }
                var correctedOffset = this._mergeOffsets(ARROW_OFFSET_CORRECTION[contentPositionAt], arrowPosition.offset);
                return {
                        my: arrowPositionMy,
                        at: arrowPositionAt,
                        of: this._$content,
                        offset: correctedOffset
                    }
            },
            _getDefaultArrowPosition: function() {
                var popoverSide = this._getDisplaySide(this._contentPosition);
                return this._isPopoverLargerThanTarget() ? {
                        my: this._opositeSide(popoverSide),
                        at: popoverSide,
                        of: $(this.option("target"))
                    } : {
                        my: popoverSide,
                        at: this._opositeSide(popoverSide),
                        of: this._$content,
                        offset: ARROW_OFFSET_CORRECTION[popoverSide]
                    }
            },
            _opositeSide: function(side) {
                switch (side) {
                    case"left":
                        return "right";
                    case"right":
                        return "left";
                    case"top":
                        return "bottom";
                    case"bottom":
                        return "top";
                    default:
                        return "center"
                }
            },
            _isPopoverLargerThanTarget: function() {
                if (this._$content.is(':hidden'))
                    return true;
                if (this._position.of.target)
                    return false;
                var position = this._positionSide,
                    $target = $(this._position.of),
                    popoverSize,
                    targetSize;
                switch (position) {
                    case"top":
                    case"bottom":
                        popoverSize = this._$content.width();
                        targetSize = $target.outerWidth() + this._$arrow.width();
                        break;
                    case"left":
                    case"right":
                        popoverSize = this._$content.height();
                        targetSize = $target.outerHeight() + this._$arrow.height();
                        break
                }
                return popoverSize > targetSize
            },
            _mergeOffsets: function(baseOffset, additionalOffset) {
                if (!additionalOffset)
                    return baseOffset;
                var base = this._getOffsetObject(baseOffset),
                    addition = this._getOffsetObject(additionalOffset);
                return base.h + addition.h + " " + (base.v + addition.v)
            },
            _renderShadingPosition: function() {
                if (this.option("shading"))
                    this._$wrapper.css({
                        top: 0,
                        left: 0
                    })
            },
            _renderShadingDimensions: function() {
                if (this.option("shading"))
                    this._$wrapper.css({
                        width: "100%",
                        height: "100%"
                    })
            },
            _togglePositionClass: function(positionClass) {
                this._$wrapper.removeClass("dx-position-left dx-position-right dx-position-top dx-position-bottom").addClass(positionClass)
            },
            _toggleFlippedClass: function(isFlippedVertical, isFlippedHorizontal) {
                this._$wrapper.toggleClass("dx-popover-flipped-vertical", isFlippedVertical).toggleClass("dx-popover-flipped-horizontal", isFlippedHorizontal)
            },
            _normalizePosition: function() {
                var position = this.option("position");
                if (DX.utils.isString(position))
                    position = $.extend({}, POSITION_ALIASES[position]);
                if (!position.of)
                    position.of = this.option("target");
                if (!position.collision)
                    position.collision = "flip";
                if (!position.boundaryOffset)
                    position.boundaryOffset = this.option("boundaryOffset");
                this._positionSide = this._getDisplaySide(position);
                this._position = position
            },
            _getDisplaySide: function(position) {
                var my = DX.position.normalizeAlign(position.my);
                var at = DX.position.normalizeAlign(position.at);
                var myHorizontalWeight = this._weightOfSide(my.h);
                var myVerticalWeight = this._weightOfSide(my.v);
                var atHorizontalWeight = this._weightOfSide(at.h);
                var atVerticalWeight = this._weightOfSide(at.v);
                return Math.abs(myHorizontalWeight - atHorizontalWeight) > Math.abs(myVerticalWeight - atVerticalWeight) ? at.h : at.v
            },
            _weightOfSide: function(side) {
                if (side === "left" || side === "top")
                    return -1;
                if (side === "center" || side === "center")
                    return 0;
                if (side === "right" || side === "bottom")
                    return 1
            },
            _getOffsetObject: function(offset) {
                return DX.utils.stringPairToObject(offset)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"showTitle":
                    case"title":
                    case"titleTemplate":
                        this.callBase(args);
                        this._renderGeometry();
                        break;
                    case"target":
                    case"boundaryOffset":
                    case"arrowPosition":
                        this._renderGeometry();
                        break;
                    case"fullScreen":
                        if (args.value)
                            this.option("fullScreen", false);
                        break;
                    default:
                        this.callBase(args)
                }
            },
            show: function(target) {
                if (target)
                    this.option("target", target);
                return this.callBase()
            }
        }));
        ui.dxPopover.__internals = {
            POPOVER_CLASS: POPOVER_CLASS,
            POPOVER_WRAPPER_CLASS: POPOVER_WRAPPER_CLASS,
            POPOVER_ARROW_CLASS: POPOVER_ARROW_CLASS,
            POPOVER_WITHOUT_TITLE_CLASS: POPOVER_WITHOUT_TITLE_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tooltip.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            TOOLTIP_CLASS = "dx-tooltip",
            TOOLTIP_WRAPPER_CLASS = "dx-tooltip-wrapper",
            Z_INDEX_STACK = [],
            FIRST_Z_INDEX_OFFSET = -500;
        DX.registerComponent("dxTooltip", ui, ui.dxPopover.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    showTitle: false,
                    title: undefined,
                    titleTemplate: undefined,
                    bottomTemplate: undefined
                })
            },
            _render: function() {
                this.element().addClass(TOOLTIP_CLASS);
                this._wrapper().addClass(TOOLTIP_WRAPPER_CLASS);
                this.callBase()
            },
            _renderContent: function() {
                this.callBase();
                this._contentId = new DevExpress.data.Guid;
                this._$content.attr({
                    id: this._contentId,
                    role: "tooltip"
                });
                this._toggleAriaDescription(true)
            },
            _toggleAriaDescription: function(showing) {
                var $target = $(this.option("target")),
                    label = showing ? this._contentId : undefined;
                this.setAria("describedby", label, $target)
            },
            _zIndexStack: function() {
                return Z_INDEX_STACK
            },
            _zIndexInitValue: function() {
                return this.callBase() + FIRST_Z_INDEX_OFFSET
            }
        }));
        ui.dxTooltip.__internals = {
            TOOLTIP_CLASS: TOOLTIP_CLASS,
            TOOLTIP_WRAPPER_CLASS: TOOLTIP_WRAPPER_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dropDownMenu.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var DROP_DOWN_MENU_CLASS = "dx-dropdownmenu",
            DROP_DOWN_MENU_POPUP_CLASS = "dx-dropdownmenu-popup",
            DROP_DOWN_MENU_POPUP_WRAPPER_CLASS = DROP_DOWN_MENU_POPUP_CLASS + "-wrapper",
            DROP_DOWN_MENU_LIST_CLASS = "dx-dropdownmenu-list",
            DROP_DOWN_MENU_BUTTON_CLASS = "dx-dropdownmenu-button";
        var POPUP_OPTION_MAP = {
                popupWidth: "width",
                popupHeight: "height"
            };
        var BUTTON_OPTION_MAP = {
                buttonIcon: "icon",
                buttonText: "text"
            };
        DX.registerComponent("dxDropDownMenu", ui, ui.Widget.inherit({
            _supportedKeys: function() {
                return $.extend(this.callBase(), {tab: function(e) {
                            this._popup.hide()
                        }})
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    itemClickAction: {
                        since: "14.2",
                        alias: "onItemClick"
                    },
                    buttonClickAction: {
                        since: "14.2",
                        alias: "onButtonClick"
                    },
                    itemRender: {
                        since: "14.2",
                        alias: "itemTemplate"
                    },
                    buttonIconSrc: {
                        since: "15.1",
                        alias: "buttonIcon"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    items: [],
                    onItemClick: null,
                    dataSource: null,
                    itemTemplate: "item",
                    buttonText: "",
                    buttonIcon: "overflow",
                    onButtonClick: null,
                    usePopover: false,
                    popupWidth: "auto",
                    popupHeight: "auto",
                    hoverStateEnabled: true,
                    opened: false,
                    popupPosition: "bottom",
                    popupAnimation: undefined
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: [{platform: "ios"}],
                            options: {usePopover: true}
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }, {
                            device: function(device) {
                                return device.android && (device.version[0] >= 4 && device.version[1] >= 1 || device.version[0] >= 5)
                            },
                            options: {
                                popupPosition: {
                                    my: "top " + (this.option("rtlEnabled") ? "left" : "right"),
                                    at: "top " + (this.option("rtlEnabled") ? "left" : "right")
                                },
                                popupAnimation: {
                                    show: {
                                        type: "pop",
                                        duration: 200,
                                        from: {scale: 0},
                                        to: {scale: 1}
                                    },
                                    hide: {
                                        type: "pop",
                                        duration: 200,
                                        from: {scale: 1},
                                        to: {scale: 0}
                                    }
                                }
                            }
                        }])
            },
            _dataSourceOptions: function() {
                return {paginate: false}
            },
            _init: function() {
                this.callBase();
                this._initDataSource();
                this._initItemClickAction();
                this._initButtonClickAction()
            },
            _initItemClickAction: function() {
                this._itemClickAction = this._createActionByOption("onItemClick")
            },
            _initButtonClickAction: function() {
                this._buttonClickAction = this._createActionByOption("onButtonClick")
            },
            _render: function() {
                this.element().addClass(DROP_DOWN_MENU_CLASS);
                this._renderButton();
                this.callBase();
                this.setAria({
                    role: "menubar",
                    haspopup: true,
                    expanded: this.option("opened")
                })
            },
            _clean: function() {
                this._cleanFocusState();
                this._popup.element().remove()
            },
            _renderContentImpl: function() {
                this._renderPopup()
            },
            _renderButton: function() {
                var that = this;
                var $button = this.element().addClass(DROP_DOWN_MENU_BUTTON_CLASS);
                this._button = this._createComponent($button, "dxButton", {
                    text: this.option("buttonText"),
                    icon: this.option("buttonIcon"),
                    focusStateEnabled: false,
                    onClick: function(e) {
                        that.option("opened", !that.option("opened"));
                        that._buttonClickAction(e)
                    }
                });
                var keys = this._supportedKeys(),
                    buttonKeys = this._button._supportedKeys();
                this._supportedKeys = function() {
                    return $.extend(keys, buttonKeys)
                }
            },
            _toggleMenuVisibility: function(opened) {
                var state = opened === undefined ? !this._popup.option("visible") : opened;
                this._popup.toggle(state);
                this.setAria("expanded", state)
            },
            _renderPopup: function() {
                var $popup = this._$popup = $("<div>").appendTo(this.element());
                var popupOptions = {
                        onContentReady: $.proxy(this._popupContentReadyHandler, this),
                        deferRendering: false,
                        position: this.option("popupPosition"),
                        animation: this.option("popupAnimation"),
                        onOptionChanged: $.proxy(function(args) {
                            if (args.name == "visible")
                                this.option("opened", args.value)
                        }, this)
                    };
                this._popup = this._createPopover($popup, popupOptions);
                this._popup._wrapper().addClass(DROP_DOWN_MENU_POPUP_WRAPPER_CLASS);
                this._popup._wrapper().toggleClass(DROP_DOWN_MENU_POPUP_CLASS, !this.option("usePopover"))
            },
            _popupContentReadyHandler: function() {
                var popup = this._$popup.dxPopover("instance");
                this._renderList(popup)
            },
            _createPopover: function($element, popupOptions) {
                return this._createComponent($element, "dxPopover", $.extend(popupOptions, {
                        target: this.element(),
                        height: this.option("popupHeight"),
                        width: this.option("popupWidth")
                    }))
            },
            _renderList: function(instance) {
                var $content = instance.content(),
                    that = this;
                $content.addClass(DROP_DOWN_MENU_LIST_CLASS);
                that._list = that._createComponent($content, "dxList", {
                    _keyboardProcessor: that._listProcessor,
                    pageLoadMode: "scrollBottom",
                    indicateLoading: false,
                    noDataText: "",
                    itemTemplate: that._getTemplateByOption("itemTemplate"),
                    onItemClick: function(e) {
                        that.option("opened", false);
                        that._itemClickAction(e)
                    },
                    tabIndex: -1,
                    focusStateEnabled: this.option("focusStateEnabled")
                });
                that._list._getAriaTarget = function() {
                    return that.element()
                };
                that._list.itemAttributes = function() {
                    return {role: "menuitem"}
                };
                that._setListDataSource();
                var listMaxHeight = $(window).height() * 0.5;
                if ($content.height() > listMaxHeight)
                    $content.height(listMaxHeight)
            },
            _setListDataSource: function() {
                if (this._list)
                    this._list.option("dataSource", this._dataSource || this.option("items"))
            },
            _attachKeyboardEvents: function() {
                this.callBase.apply(this, arguments);
                this._listProcessor = this._keyboardProcessor.attachChildProcessor();
                if (this._list)
                    this._list.option("_keyboardProcessor", this._listProcessor)
            },
            _cleanFocusState: function() {
                this.callBase.apply(this, arguments);
                delete this._listProcessor
            },
            _toggleVisibility: function(visible) {
                this.callBase(visible);
                this._button.option("visible", visible)
            },
            _optionChanged: function(args) {
                var name = args.name;
                var value = args.value;
                switch (name) {
                    case"items":
                    case"dataSource":
                        this._refreshDataSource();
                        this._setListDataSource();
                        break;
                    case"itemTemplate":
                        if (this._list)
                            this._list.option(name, this._getTemplate(value));
                        break;
                    case"onItemClick":
                        this._initItemClickAction();
                        break;
                    case"onButtonClick":
                        this._buttonClickAction();
                        break;
                    case"buttonIcon":
                    case"buttonText":
                        this._button.option(BUTTON_OPTION_MAP[name], value);
                        break;
                    case"popupWidth":
                    case"popupHeight":
                        this._popup.option(POPUP_OPTION_MAP[name], value);
                        break;
                    case"usePopover":
                        this._invalidate();
                        break;
                    case"focusStateEnabled":
                        if (this._list)
                            this._list.option(name, value);
                        this.callBase(args);
                        break;
                    case"opened":
                        this._toggleMenuVisibility(value);
                        break;
                    case"popupPosition":
                        break;
                    default:
                        this.callBase(args)
                }
            },
            open: function() {
                this.option("opened", true)
            },
            close: function() {
                this.option("opened", false)
            }
        }).include(ui.DataHelperMixin))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateUtils.js */
    (function($, DX, undefined) {
        var dateCopmotents = function() {
                return ["year", "day", "month", "day"]
            };
        var dateUtils = DX.ui.dateUtils = {
                SUPPORTED_FORMATS: ["date", "time", "datetime"],
                DEFAULT_FORMATTER: function(value) {
                    return value
                },
                DATE_COMPONENT_TEXT_FORMATTER: function(value, name) {
                    var $container = $("<div>").addClass("dx-dateview-formatter-container");
                    $("<span>").text(value).addClass("dx-dateview-value-formatter").appendTo($container);
                    $("<span>").text(name).addClass("dx-dateview-name-formatter").appendTo($container);
                    return $container
                },
                ONE_MINUTE: 1000 * 60,
                ONE_DAY: 1000 * 60 * 60 * 24,
                TEN_YEARS: 1000 * 60 * 60 * 24 * 365 * 10,
                FORMATS_INFO: {
                    date: {
                        standardPattern: "yyyy-MM-dd",
                        components: dateCopmotents()
                    },
                    time: {
                        standardPattern: "HH:mm",
                        components: ["hours", "minutes"]
                    },
                    datetime: {
                        standardPattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss'Z'",
                        components: dateCopmotents().concat(["hours", "minutes", "seconds", "milliseconds"])
                    },
                    "datetime-local": {
                        standardPattern: "yyyy'-'MM'-'dd'T'HH':'mm",
                        components: dateCopmotents().concat(["hours", "minutes", "seconds"])
                    }
                },
                FORMATS_MAP: {
                    date: "d",
                    time: "t",
                    datetime: "S",
                    "datetime-local": "f"
                },
                toStandardDateFormat: function(date, mode, pattern) {
                    pattern = pattern || dateUtils.FORMATS_INFO[mode].standardPattern;
                    return Globalize.format(date, pattern)
                },
                fromStandardDateFormat: function(date) {
                    return Globalize.parseDate(date, dateUtils.FORMATS_INFO["datetime"].standardPattern) || Globalize.parseDate(date, dateUtils.FORMATS_INFO["datetime-local"].standardPattern) || Globalize.parseDate(date, dateUtils.FORMATS_INFO["time"].standardPattern) || Globalize.parseDate(date, dateUtils.FORMATS_INFO["date"].standardPattern) || Date.parse && Date.parse(date) && new Date(Date.parse(date))
                },
                getMaxMonthDay: function(year, month) {
                    return new Date(year, month + 1, 0).getDate()
                },
                mergeDates: function(target, source, format) {
                    if (!source)
                        return undefined;
                    if (isNaN(target.getTime()))
                        target = new Date(0, 0, 0, 0, 0, 0);
                    var formatInfo = dateUtils.FORMATS_INFO[format];
                    $.each(formatInfo.components, function() {
                        var componentInfo = dateUtils.DATE_COMPONENTS_INFO[this];
                        target[componentInfo.setter](source[componentInfo.getter]())
                    });
                    return target
                },
                getLongestCaptionIndex: function(captionArray) {
                    var longestIndex = 0,
                        longestCaptionLength = 0,
                        i;
                    for (i = 0; i < captionArray.length; ++i)
                        if (captionArray[i].length > longestCaptionLength) {
                            longestIndex = i;
                            longestCaptionLength = captionArray[i].length
                        }
                    return longestIndex
                },
                expandPattern: function(pattern) {
                    return pattern.length === 1 ? Globalize.culture().calendar.patterns[pattern] : pattern
                },
                formatUsesMonthName: function(format) {
                    return dateUtils.expandPattern(format).indexOf("MMMM") !== -1
                },
                formatUsesDayName: function(format) {
                    return dateUtils.expandPattern(format).indexOf("dddd") !== -1
                },
                getLongestDate: function(format, monthNames, dayNames) {
                    var longestDate = new Date(1888, dateUtils.formatUsesMonthName(format) ? dateUtils.getLongestCaptionIndex(monthNames) : 9, 28 - 7, 23, 59, 59, 999);
                    if (dateUtils.formatUsesDayName(format))
                        longestDate.setDate(longestDate.getDate() - longestDate.getDay() + dateUtils.getLongestCaptionIndex(dayNames));
                    return longestDate
                },
                calculateMaximumDateFormatWidth: function(format, customFontStyles, rootElement) {
                    if (!rootElement || $(rootElement).is(":visible")) {
                        var width,
                            ieRoundingError = 2,
                            longestTextDiv = $("<div>" + Globalize.format(dateUtils.getLongestDate(format, Globalize.culture().calendar.months.names, Globalize.culture().calendar.days.names), format) + "</div>").css({
                                visibility: "hidden",
                                "white-space": "nowrap",
                                position: "absolute",
                                float: "left"
                            });
                        if (customFontStyles)
                            longestTextDiv.css(customFontStyles);
                        longestTextDiv.appendTo(rootElement ? $(rootElement) : $("body"));
                        width = longestTextDiv.width() + ieRoundingError;
                        longestTextDiv.remove();
                        return width
                    }
                }
            };
        dateUtils.DATE_COMPONENTS_INFO = {
            year: {
                getter: "getFullYear",
                setter: "setFullYear",
                possibleFormats: ["yy", "yyyy"],
                formatter: dateUtils.DEFAULT_FORMATTER,
                startValue: undefined,
                endValue: undefined
            },
            day: {
                getter: "getDate",
                setter: "setDate",
                possibleFormats: ["d", "dd"],
                formatter: function(value, showNames, date) {
                    if (!showNames)
                        return value;
                    var formatDate = new Date(date.getTime());
                    formatDate.setDate(value);
                    return dateUtils.DATE_COMPONENT_TEXT_FORMATTER(value, Globalize.culture().calendar.days.names[formatDate.getDay()])
                },
                startValue: 1,
                endValue: undefined
            },
            month: {
                getter: "getMonth",
                setter: "setMonth",
                possibleFormats: ["M", "MM", "MMM", "MMMM"],
                formatter: function(value, showNames) {
                    var monthName = Globalize.culture().calendar.months.names[value];
                    return showNames ? dateUtils.DATE_COMPONENT_TEXT_FORMATTER(value + 1, monthName) : monthName
                },
                startValue: 0,
                endValue: 11
            },
            hours: {
                getter: "getHours",
                setter: "setHours",
                possibleFormats: ["H", "HH", "h", "hh"],
                formatter: function(value) {
                    return Globalize.format(new Date(0, 0, 0, value), "HH")
                },
                startValue: 0,
                endValue: 23
            },
            minutes: {
                getter: "getMinutes",
                setter: "setMinutes",
                possibleFormats: ["m", "mm"],
                formatter: function(value) {
                    return Globalize.format(new Date(0, 0, 0, 0, value), "mm")
                },
                startValue: 0,
                endValue: 59
            },
            seconds: {
                getter: "getSeconds",
                setter: "setSeconds",
                possibleFormats: ["s", "ss"],
                formatter: function(value) {
                    return Globalize.format(new Date(0, 0, 0, 0, 0, value), "ss")
                },
                startValue: 0,
                endValue: 59
            },
            milliseconds: {
                getter: "getMilliseconds",
                setter: "setMilliseconds",
                possibleFormats: ["f", "ff", "fff"],
                formatter: function(value) {
                    return Globalize.format(new Date(0, 0, 0, 0, 0, 0, value), "fff")
                },
                startValue: 0,
                endValue: 999
            }
        };
        (function androidFormatDetection() {
            var androidFormatPattern = "yyyy'-'MM'-'dd'T'HH':'mm'Z'";
            var $input = $("<input>").attr("type", "datetime");
            $input.val(dateUtils.toStandardDateFormat(new Date, "datetime", androidFormatPattern));
            if ($input.val())
                dateUtils.FORMATS_INFO.datetime.standardPattern = androidFormatPattern
        })()
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.calendar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            events = ui.events,
            utils = DX.utils,
            CALENDAR_CLASS = "dx-calendar",
            CALENDAR_BODY_CLASS = "dx-calendar-body",
            CALENDAR_CELL_CLASS = "dx-calendar-cell",
            CALENDAR_EMPTY_CELL_CLASS = "dx-calendar-empty-cell",
            CALENDAR_FOOTER_CLASS = "dx-calendar-footer",
            CALENDAR_TODAY_BUTTON_CLASS = "dx-calendar-today-button",
            CALENDAR_HAS_FOOTER_CLASS = "dx-calendar-with-footer",
            MONTH_VIEW_ANIMATION_DURATION = 300,
            ANIMATION_DURATION_ILLEGAL_RANGE = 200,
            ANIMATION_DURATION_SHOW_VIEW = 250,
            POP_ANIMATION_FROM = 0.6,
            POP_ANIMATION_TO = 1,
            SHOT_SWIPE_OFFSET = 0.5,
            CALENDAR_DATE_VALUE_KEY = "dxDateValueKey",
            SWIPE_POSITION = {
                left: -1,
                right: 1
            },
            LEVEL_COMPARE_MAP = {
                month: 3,
                year: 2,
                decade: 1,
                century: 0
            };
        DX.registerComponent("dxCalendar", ui, ui.Editor.inherit({
            _activeStateUnit: "." + CALENDAR_CELL_CLASS,
            _supportedKeys: function() {
                var isRTL = this.option("rtlEnabled"),
                    offset = utils.getDifferenceInMonth(this.option("zoomLevel"));
                return $.extend(this.callBase(), {
                        rightArrow: function(e) {
                            if (e.ctrlKey)
                                this._waitRenderView(offset, isRTL ? -1 : 1);
                            else {
                                this._change = "key";
                                return true
                            }
                        },
                        leftArrow: function(e) {
                            if (e.ctrlKey)
                                this._waitRenderView(offset, isRTL ? 1 : -1);
                            else {
                                this._change = "key";
                                return true
                            }
                        },
                        upArrow: function(e) {
                            if (e.ctrlKey)
                                this._navigateUp();
                            else {
                                this._change = "upDownArrow";
                                return true
                            }
                        },
                        downArrow: function(e) {
                            if (e.ctrlKey)
                                this._navigateDown();
                            else {
                                this._change = "upDownArrow";
                                return true
                            }
                        },
                        pageUp: function(e) {
                            e.preventDefault();
                            this._waitRenderView(offset, -1)
                        },
                        pageDown: function(e) {
                            e.preventDefault();
                            this._waitRenderView(offset, 1)
                        },
                        tab: $.noop,
                        enter: function(e) {
                            if (!this._isMaxZoomLevel())
                                this._navigateDown();
                            else
                                return true
                        }
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    currentDate: new Date,
                    min: undefined,
                    max: undefined,
                    firstDayOfWeek: undefined,
                    zoomLevel: "month",
                    maxZoomLevel: "month",
                    minZoomLevel: "century",
                    showTodayButton: false,
                    cellTemplate: "cell",
                    onCellClick: null,
                    onContouredChanged: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function() {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {
                                focusStateEnabled: true,
                                hoverStateEnabled: true
                            }
                        }])
            },
            _init: function() {
                this.callBase();
                this._correctZoomLevel();
                this._updateCurrentDate(this.option("value"));
                this._initActions()
            },
            _initActions: function() {
                this._cellClickOptionAction = this._createActionByOption("onCellClick");
                var cellClickAction = this._createAction($.proxy(function(e) {
                        this._cellClickHandler(e.jQueryEvent)
                    }, this))
            },
            _correctZoomLevel: function() {
                var maxZoomLevel = this.option("maxZoomLevel"),
                    minZoomLevel = this.option("minZoomLevel"),
                    zoomLevel = this.option("zoomLevel");
                if (LEVEL_COMPARE_MAP[maxZoomLevel] < LEVEL_COMPARE_MAP[minZoomLevel])
                    return;
                if (LEVEL_COMPARE_MAP[zoomLevel] > LEVEL_COMPARE_MAP[maxZoomLevel])
                    this.option("zoomLevel", maxZoomLevel);
                else if (LEVEL_COMPARE_MAP[zoomLevel] < LEVEL_COMPARE_MAP[minZoomLevel])
                    this.option("zoomLevel", minZoomLevel)
            },
            _updateCurrentDate: function(value) {
                var min = this.option("min"),
                    max = this.option("max");
                if (min && max && min > max) {
                    this.option("currentDate", new Date);
                    return
                }
                if (min)
                    min = new Date(min);
                if (max)
                    max = new Date(max);
                var date = value || new Date(this.option("currentDate")),
                    normalizedDate = new Date(utils.normalizeDate(date, min, max));
                normalizedDate.setDate(1);
                this.option("currentDate", normalizedDate);
                var zoomLevel = this.option("zoomLevel"),
                    isNewView = this._view && !utils.sameView(zoomLevel, normalizedDate, this._view.option("date"));
                if (isNewView) {
                    this._view.element().remove();
                    delete this._view;
                    this._renderView()
                }
            },
            _render: function() {
                this.callBase();
                this.element().addClass(CALENDAR_CLASS);
                this._renderView();
                this._renderFooter();
                this.onContouredChanged = this._createActionByOption("onContouredChanged");
                this.setAria({
                    role: "listbox",
                    label: Globalize.localize("dxCalendar-ariaWidgetName")
                })
            },
            _renderView: function() {
                this._change = "";
                this._renderBody();
                this._renderSpecificView();
                this._renderNavigator();
                this._renderSwipeable()
            },
            _renderBody: function() {
                if (!this._body) {
                    this._body = $("<div>").addClass(CALENDAR_BODY_CLASS);
                    this.element().append(this._body)
                }
            },
            _renderSwipeable: function() {
                var that = this;
                if (!this._swipeable)
                    this._swipeable = this._createComponent(this.element(), "dxSwipeable", {
                        elastic: false,
                        onStart: function(e) {
                            that._swipeStartHandler(e)
                        },
                        onUpdated: function(e) {
                            that._swipeUpdateHandler(e)
                        },
                        onEnd: function(e) {
                            that._swipeEndHandler(e)
                        },
                        itemWidthFunc: function() {
                            return this.element().width()
                        }
                    })
            },
            _waitRenderView: function(offset, direction) {
                if (this._alreadyViewRender)
                    return;
                this._alreadyViewRender = true;
                this._change = "";
                this._navigate(offset * direction);
                setTimeout($.proxy(function() {
                    this._alreadyViewRender = false
                }, this))
            },
            _focusTarget: function() {
                return this.element()
            },
            _focusOutHandler: function() {
                this.callBase.apply(this, arguments);
                this._view.option("contouredDate", undefined)
            },
            _focusInHandler: function() {
                this.callBase.apply(this, arguments);
                this._view.focusInHandler()
            },
            _attachKeyboardEvents: function() {
                this.callBase.apply(this, arguments);
                this._viewKeyboardProcessor = new ui.KeyboardProcessor;
                this._keyboardProcessor.push(this._viewKeyboardProcessor)
            },
            _swipeStartHandler: function(e) {
                if (this._viewsAnimating) {
                    e.jQueryEvent.cancel = true;
                    return
                }
                this._swipeInProgress = true;
                this._viewsOnLeft = [this._view];
                this._viewsOnRight = [this._view]
            },
            _swipeUpdateHandler: function(e) {
                this._setOffset(e.jQueryEvent.offset);
                if (this._swipeOffset >= 0)
                    this._renderViews(this._viewsOnLeft, SWIPE_POSITION.right);
                else
                    this._renderViews(this._viewsOnRight, SWIPE_POSITION.left)
            },
            _setOffset: function(offset) {
                var swipeDirection = offset > 0 ? SWIPE_POSITION.right : SWIPE_POSITION.left;
                if (!(swipeDirection * (offset - this._swipeOffset) > 1))
                    this._swipeOffset = offset
            },
            _renderViews: function(viewsArray, swipePosition) {
                var arrayInsertIndex = Math.ceil(swipePosition * this._swipeOffset),
                    zoomLevel = this.option("zoomLevel");
                var offset = swipePosition * arrayInsertIndex;
                offset *= utils.getDifferenceInMonth(zoomLevel);
                offset = this.option("rtlEnabled") ? offset : -1 * offset;
                this._initalizeViewDimensions();
                if (!viewsArray[arrayInsertIndex]) {
                    this._newDate = new Date(this.option("currentDate"));
                    this._newDate.setMonth(this._newDate.getMonth() + offset);
                    var $body = this._body,
                        $view = $("<div>").appendTo($body);
                    viewsArray[arrayInsertIndex] = new ui.dxCalendar.views[zoomLevel]($view, this._viewConfig())
                }
                this._translateViews(viewsArray, swipePosition)
            },
            _translateViews: function(viewsArray, swipePosition) {
                var prevView = viewsArray[Math.floor(swipePosition * this._swipeOffset)],
                    nextView = viewsArray[Math.ceil(swipePosition * this._swipeOffset)],
                    localOffset = this._swipeOffset % 1;
                this._normalizeViewsPosition();
                DX.translator.move(prevView.element(), {left: this._correctionMovement * localOffset * this._viewWidth});
                if (swipePosition * localOffset >= 0.05)
                    DX.translator.move(nextView.element(), {left: this._correctionMovement * (localOffset - swipePosition) * this._viewWidth});
                this._view = this._isInView(prevView, this._viewWidth / 2) ? prevView : nextView;
                this._renderNavigator()
            },
            _normalizeViewsPosition: function() {
                for (var i = 0; i < this._viewsOnLeft.length; i++)
                    DX.translator.move(this._viewsOnLeft[i].element(), {left: -this._correctionMovement * this._viewWidth});
                for (var i = 0; i < this._viewsOnRight.length; i++)
                    DX.translator.move(this._viewsOnRight[i].element(), {left: this._correctionMovement * this._viewWidth})
            },
            _isDateInInvalidRange: function() {
                if (this._view.isBoundary(this._newDate))
                    return;
                var min = this.option("min"),
                    max = this.option("max"),
                    normalizedDate = utils.normalizeDate(this._newDate, min, max);
                return normalizedDate === min || normalizedDate === max
            },
            _trimUnusedViews: function(viewsArray) {
                var animatedViews = viewsArray.slice(),
                    indexCurrentView = $.inArray(this._view, animatedViews) + 1,
                    boundaryIndex = this._getBoundaryIndexView(animatedViews);
                animatedViews = animatedViews.splice(0, indexCurrentView + 1);
                animatedViews.splice(0, boundaryIndex);
                this._disposeUnusedViews(viewsArray, indexCurrentView);
                return animatedViews
            },
            _cleanFocusState: function() {
                this.callBase();
                if (this._viewKeyboardProcessor)
                    this._viewKeyboardProcessor.dispose()
            },
            _getBoundaryIndexView: function(arrayViews) {
                var length = arrayViews.length;
                for (var i = length - 1; i >= 0; i--) {
                    if (!arrayViews[i])
                        continue;
                    if (this._view.isBoundary(arrayViews[i].option("date")))
                        return i
                }
            },
            _disposeUnusedViews: function(arrayViews, index) {
                var length = arrayViews.length;
                for (var i = length - 1; i > index; i--)
                    arrayViews[i].element().remove()
            },
            _moveInRange: function(arrayViews, swipePosition) {
                var length = arrayViews.length,
                    startOffset = arrayViews[length - 1].element().position().left * swipePosition,
                    summaryWidth = startOffset;
                for (var i = length - 1; i >= 0; i--) {
                    DX.translator.move(arrayViews[i].element(), {left: this._correctionMovement * summaryWidth * swipePosition});
                    summaryWidth += arrayViews[i].element().width()
                }
                summaryWidth -= arrayViews[0].element().width();
                return this._animateToBoundary(arrayViews, summaryWidth, swipePosition)
            },
            _animateToBoundary: function(arrayViews, summaryWidth, swipePosition) {
                this._animation = $.Deferred();
                var length = arrayViews.length;
                for (var i = length - 1; i >= 0; i--) {
                    var leftPosition = arrayViews[i].element().position().left;
                    this._animateView(arrayViews[i], leftPosition - summaryWidth * swipePosition, ANIMATION_DURATION_ILLEGAL_RANGE * length)
                }
                return this._animation.promise()
            },
            _swipeEndHandler: function(e) {
                var that = this,
                    targetOffset = e.jQueryEvent.targetOffset;
                this._viewsAnimating = true;
                var animation,
                    isShortSwipe = false;
                if (Math.abs(e.jQueryEvent.offset) < SHOT_SWIPE_OFFSET)
                    if (targetOffset === 1 || targetOffset === -1)
                        isShortSwipe = true;
                if (this._isDateInInvalidRange()) {
                    this._toggleNavigatorDisabled(true);
                    this._$footer && this._$footer.toggleClass("dx-state-disabled", true);
                    if (this._swipeOffset > 0) {
                        animation = this._animatedIllegalRange(that._viewsOnLeft, SWIPE_POSITION.right);
                        this._newDate = new Date(this.option("min"))
                    }
                    else {
                        animation = this._animatedIllegalRange(that._viewsOnRight, SWIPE_POSITION.left);
                        this._newDate = new Date(this.option("max"))
                    }
                }
                else
                    animation = this._alignViews(isShortSwipe);
                animation.done(function() {
                    that._disposeViews();
                    if (!that._isDateInInvalidRange())
                        that.option("currentDate", that._view.option("date"));
                    that._viewsAnimating = false;
                    that._toggleNavigatorDisabled(false);
                    that._$footer && that._$footer.toggleClass("dx-state-disabled", false);
                    that._normalizedCircledDate(that._view.option("date"))
                });
                this._swipeInProgress = false;
                this._swipeOffset = 0
            },
            _animatedIllegalRange: function(viewsArray, swipeDirection) {
                var animatedViews = this._trimUnusedViews(viewsArray);
                return this._moveInRange(animatedViews, swipeDirection)
            },
            _alignViews: function(isShortSwipe) {
                this._animation = $.Deferred();
                this._swipeOffset = this._swipeOffset || 0;
                var firstVisibleView,
                    secondVisibleView;
                if (this._swipeOffset >= 0)
                    firstVisibleView = this._viewsOnLeft[Math.floor(Math.abs(this._swipeOffset))],
                    secondVisibleView = this._viewsOnLeft[Math.ceil(Math.abs(this._swipeOffset))];
                else
                    firstVisibleView = this._viewsOnRight[Math.ceil(Math.abs(this._swipeOffset))],
                    secondVisibleView = this._viewsOnRight[Math.floor(Math.abs(this._swipeOffset))];
                if (this._isInView(firstVisibleView, this._viewWidth / 2))
                    if (isShortSwipe)
                        this._arrangeViews(secondVisibleView, firstVisibleView, SWIPE_POSITION.right);
                    else
                        this._arrangeViews(firstVisibleView, secondVisibleView, SWIPE_POSITION.left);
                else if (isShortSwipe)
                    this._arrangeViews(firstVisibleView, secondVisibleView, SWIPE_POSITION.left);
                else
                    this._arrangeViews(secondVisibleView, firstVisibleView, SWIPE_POSITION.right);
                this._renderNavigator();
                return this._animation.promise()
            },
            _arrangeViews: function(firstView, secondView, swipePosition) {
                this._centerView(firstView);
                this._animateView(secondView, swipePosition * this._viewWidth, MONTH_VIEW_ANIMATION_DURATION)
            },
            _animateView: function(view, to, duration) {
                var that = this;
                fx.animate(view.element(), {
                    type: "slide",
                    from: {left: view.element().position().left},
                    to: {left: to},
                    duration: duration,
                    complete: function() {
                        that._animation.resolve()
                    }
                })
            },
            _centerView: function(view) {
                this._animateView(view, 0, MONTH_VIEW_ANIMATION_DURATION);
                this._view = view
            },
            _isInView: function(view, point) {
                var $element = view.element(),
                    left = $element.position().left;
                return point > left && point <= left + $element.width()
            },
            _disposeViews: function() {
                var that = this;
                for (var i = 0; i < this._viewsOnLeft.length; i++)
                    if (this._viewsOnLeft[i] !== this._view)
                        this._viewsOnLeft[i].element().remove();
                for (var i = 0; i < this._viewsOnRight.length; i++)
                    if (this._viewsOnRight[i] !== this._view)
                        this._viewsOnRight[i].element().remove();
                this._viewsOnLeft = [];
                this._viewsOnRight = []
            },
            _renderFooter: function() {
                var that = this,
                    showTodayButton = this.option("showTodayButton");
                if (showTodayButton) {
                    var $todayButton = this._createComponent($("<a>"), "dxButton", {
                            focusStateEnabled: false,
                            text: Globalize.localize("dxCalendar-todayButtonText"),
                            onClick: function() {
                                that._toTodayView()
                            }
                        }).element().addClass(CALENDAR_TODAY_BUTTON_CLASS);
                    this._$footer = $("<div>").addClass(CALENDAR_FOOTER_CLASS).append($todayButton);
                    this.element().append(this._$footer)
                }
                this.element().toggleClass(CALENDAR_HAS_FOOTER_CLASS, showTodayButton)
            },
            _toTodayView: function() {
                var today = new Date;
                if (!this._isMaxZoomLevel()) {
                    this.option("currentDate", today);
                    this.option("zoomLevel", this.option("maxZoomLevel"));
                    this._animateShowView();
                    this.option("value", today);
                    return
                }
                var currentDate = this._view.option("date"),
                    offset = 0;
                offset += (today.getFullYear() - currentDate.getFullYear()) * 12;
                offset += today.getMonth() - currentDate.getMonth();
                if (!offset) {
                    this.option("value", today);
                    return
                }
                this._addPrevView(today);
                this._animateNavigation(offset).done($.proxy(function() {
                    this._clearPrevView();
                    this.option("value", new Date)
                }, this))
            },
            _isMaxZoomLevel: function() {
                return this.option("zoomLevel") === this.option("maxZoomLevel")
            },
            _renderNavigator: function() {
                if (!this._navigator) {
                    var $navigator = $("<div>").prependTo(this.element());
                    this._navigator = new ui.dxCalendar.Navigator($navigator, this._navigatorConfig())
                }
                this._navigator.option("text", this._view._getNavigatorCaption());
                this._updateButtonsVisibility()
            },
            _updateButtonsVisibility: function() {
                var viewType = this.option("zoomLevel"),
                    isRTL = this.option("rtlEnabled"),
                    difference = isRTL ? -1 * utils.getDifferenceInMonth(viewType) : 1 * utils.getDifferenceInMonth(viewType);
                this._navigator.toggleButton("next", !this._view.canNavigate(difference));
                this._navigator.toggleButton("prev", !this._view.canNavigate(-difference))
            },
            _navigatorConfig: function() {
                return {
                        text: this._view._getNavigatorCaption(),
                        onClick: $.proxy(this._navigatorClickHandler, this),
                        onCaptionClick: $.proxy(this._navigateUp, this),
                        rtlEnabled: this.option("rtlEnabled")
                    }
            },
            _navigatorClickHandler: function(e) {
                var viewType = this.option("zoomLevel"),
                    difference = utils.getDifferenceInMonth(viewType),
                    deltaDifference = difference * e.direction;
                this._navigate(deltaDifference)
            },
            _isMinZoomLevel: function(zoomLevel) {
                var min = this.option("min"),
                    max = this.option("max");
                return utils.sameView(zoomLevel, min, max) || this.option("minZoomLevel") === zoomLevel
            },
            _navigateUp: function() {
                var zoomLevel = this.option("zoomLevel"),
                    nextView = utils.getViewUp(zoomLevel);
                if (!nextView || this._isMinZoomLevel(zoomLevel))
                    return;
                this._contouredStack = this._contouredStack || [];
                var contouredDate = this._view.option("contouredDate");
                contouredDate && this._contouredStack.push(contouredDate);
                this.option("currentDate", contouredDate || this._view.option("date"));
                this.option("zoomLevel", nextView);
                this._animateShowView()
            },
            _navigateDown: function(cell) {
                var zoomLevel = this.option("zoomLevel");
                if (this._isMaxZoomLevel())
                    return;
                var nextView = utils.getViewDown(zoomLevel);
                if (!nextView)
                    return;
                var newCurrentDate = this._view.option("contouredDate") || this._view.option("date");
                if (cell)
                    newCurrentDate = $(cell).data(CALENDAR_DATE_VALUE_KEY);
                this.option("currentDate", newCurrentDate);
                this.option("zoomLevel", nextView);
                this._animateShowView();
                if (this._contouredStack && this._contouredStack.length > 0) {
                    var circledDate = this._view.getCircledDate(newCurrentDate, this._contouredStack);
                    this._normalizedCircledDate(circledDate);
                    this._view.option("contouredDate", circledDate);
                    return
                }
                this._normalizedCircledDate(newCurrentDate);
                this._view.option("contouredDate", newCurrentDate)
            },
            _animateShowView: function() {
                fx.stop(this._view.element(), true);
                this._viewsAnimating = true;
                this._popAnimationView(this._view, POP_ANIMATION_FROM, POP_ANIMATION_TO, ANIMATION_DURATION_SHOW_VIEW).done($.proxy(function() {
                    this._viewsAnimating = false;
                    this._view.moveContouredDate(0)
                }, this))
            },
            _toggleNavigatorDisabled: function(state) {
                this._navigator && this._navigator.option("disabled", state)
            },
            _popAnimationView: function(view, from, to, duration) {
                return fx.animate(view.element(), {
                        type: "pop",
                        from: {
                            scale: from,
                            opacity: from
                        },
                        to: {
                            scale: to,
                            opacity: to
                        },
                        duration: duration
                    })
            },
            _renderSpecificView: function() {
                var specificView = ui.dxCalendar.views[this.option("zoomLevel")],
                    $body = this._body,
                    $view = $("<div>").appendTo($body);
                this._view = new specificView($view, this._viewConfig());
                this.element().addClass("dx-calendar-view-" + this.option("zoomLevel"));
                this._correctionMovement = DX.browser.msie && this.option("rtlEnabled") ? -1 : 1
            },
            _viewConfig: function() {
                return {
                        date: this._swipeInProgress ? this._newDate : this.option("currentDate"),
                        min: this.option("min"),
                        max: this.option("max"),
                        firstDayOfWeek: this.option("firstDayOfWeek"),
                        value: this.option("value"),
                        rtl: this.option("rtlEnabled"),
                        disabled: this.option("disabled") || DevExpress.designMode,
                        _keyboardProcessor: this._viewKeyboardProcessor,
                        tabIndex: undefined,
                        focusStateEnabled: this.option("focusStateEnabled"),
                        hoverStateEnabled: this.option("hoverStateEnabled"),
                        onValueChanged: $.proxy(this._viewValueChangedHandler, this),
                        onContouredDateChanged: $.proxy(this._viewContouredChangedHandler, this),
                        onCellClick: $.proxy(this._handlerOnCellClick, this),
                        cellTemplate: this._getTemplateByOption("cellTemplate"),
                        allowValueSelection: this._isMaxZoomLevel()
                    }
            },
            _cellClickHandler: function(e) {
                this._cellClickAction({jQueryEvent: e})
            },
            _handlerOnCellClick: function(e) {
                var zoomLevel = this.option("zoomLevel"),
                    nextView = utils.getViewDown(zoomLevel);
                var _isMaxZoomLevel = this._isMaxZoomLevel();
                if (nextView && !_isMaxZoomLevel) {
                    var target = e.jQueryEvent.currentTarget;
                    this._navigateDown(target)
                }
                else
                    this._cellClickOptionAction(e)
            },
            _viewValueChangedHandler: function(e) {
                if (this._isMaxZoomLevel())
                    this.option("value", e.value)
            },
            _viewContouredChangedHandler: function(e) {
                var date = e.value,
                    currentDate = this.option("currentDate"),
                    zoomLevel = this.option("zoomLevel"),
                    isSameView = utils.sameView(zoomLevel, currentDate, date);
                this.setAria("activedescendant", e.ariaId);
                this.onContouredChanged && this.onContouredChanged(e.ariaId);
                if (date && !isSameView && !this._isAlreadyNavigated && (this._isMaxZoomLevel() || this._change === "key" || this._change === "upDownArrow")) {
                    var dir = utils.getFirstMonthDate(date) > currentDate ? 1 : -1,
                        difference = utils.getDifferenceInMonth(zoomLevel) * dir;
                    this._isAlreadyNavigated = true;
                    this._navigate(difference)
                }
            },
            _normalizedCircledDate: function(date) {
                if (this._view.isBoundary(date)) {
                    var zoomLevel = this.option("zoomLevel"),
                        $cells = this._view.$body.find("." + CALENDAR_CELL_CLASS).not("." + CALENDAR_EMPTY_CELL_CLASS);
                    var min = this.option("min"),
                        max = this.option("max"),
                        $cell;
                    if (utils.sameView(zoomLevel, min, max))
                        $cell = Math.abs(min - date) > Math.abs(max - date) ? $cells.last() : $cells.first();
                    else if (utils.sameView(zoomLevel, date, min))
                        $cell = $cells.first();
                    else if (utils.sameView(zoomLevel, date, max))
                        $cell = $cells.last();
                    date = $cell ? $cell.data(CALENDAR_DATE_VALUE_KEY) : date;
                    this._view.option("contouredDate", date);
                    return
                }
                var currentDate = this.option("currentDate"),
                    $cell = this._view._getCellByDate(utils.getShortDate(date));
                if (!$cell.length && !utils.dateInRange(date, this.option("min"), this.option("max"))) {
                    this._view.option("contouredDate", currentDate);
                    return
                }
                if (!$cell.hasClass(CALENDAR_EMPTY_CELL_CLASS)) {
                    this._view.option("contouredDate", date);
                    return
                }
                this._view.option("contouredDate", date)
            },
            _initalizeViewDimensions: function() {
                this._viewWidth = this._viewWidth || this._body.width();
                this._viewHeight = this._viewHeight || this._body.height()
            },
            _navigate: function(difference) {
                if (this._view.canNavigate(difference)) {
                    var currentDate = this.option("currentDate"),
                        newDate = new Date(currentDate);
                    var circledDate;
                    newDate.setMonth(currentDate.getMonth() + difference);
                    utils.fixTimezoneGap(currentDate, newDate);
                    circledDate = this._view.getNextCircledDate(difference);
                    if (this._change === "upDownArrow")
                        circledDate = this._view.option("contouredDate");
                    if (this._change === "key") {
                        var zoomLevel = this.option("zoomLevel");
                        circledDate = difference < 0 ? utils.getLastDateView(zoomLevel, newDate) : utils.getFirstDateView(zoomLevel, newDate)
                    }
                    this._changeView(newDate, difference);
                    this._normalizedCircledDate(circledDate)
                }
            },
            _changeView: function(newDate, difference) {
                var that = this;
                if (fx.isAnimating(this._view.element())) {
                    this._stopCurrentAnimation();
                    this._prevView && this._prevView.element().remove()
                }
                this._addPrevView(newDate);
                this._animateNavigation(difference).done(function() {
                    that._clearPrevView();
                    that._isAlreadyNavigated = false
                })
            },
            _clearPrevView: function() {
                this._prevView.element().remove();
                delete this._prevView
            },
            _addPrevView: function(date) {
                var $view = $("<div>");
                this._prevView = new ui.dxCalendar.views[this.option("zoomLevel")]($view, this._viewConfig());
                this._body.append(this._prevView.element());
                this.option("currentDate", date)
            },
            _stopCurrentAnimation: function() {
                this._prevView && fx.stop(this._prevView.element(), true);
                fx.stop(this._view.element(), true)
            },
            _animateNavigation: function(difference) {
                this._animation = $.Deferred();
                this._initalizeViewDimensions();
                var navDirection = difference < 0 ? -1 : 1;
                DX.translator.move(this._view.element(), {left: this._correctionMovement * navDirection * this._viewWidth});
                this._animateView(this._view, 0, MONTH_VIEW_ANIMATION_DURATION);
                this._animateView(this._prevView, -navDirection * this._viewWidth, MONTH_VIEW_ANIMATION_DURATION);
                return this._animation.promise()
            },
            _clean: function() {
                this.callBase();
                delete this._body;
                delete this._navigator;
                delete this._$footer;
                delete this._viewWidth;
                delete this._viewHeight
            },
            _optionChanged: function(args) {
                var value = args.value;
                switch (args.name) {
                    case"min":
                    case"max":
                    case"firstDayOfWeek":
                        var date = this.option("value");
                        date = date ? new Date(date) : new Date;
                        this._updateCurrentDate(date);
                        this._view.element().remove();
                        this._renderView();
                        break;
                    case"currentDate":
                        this._updateCurrentDate(value);
                        break;
                    case"zoomLevel":
                        this.element().removeClass("dx-calendar-view-" + args.previousValue);
                        this._correctZoomLevel();
                        this._view.element().remove();
                        delete this._view;
                        this._renderView();
                        this._updateButtonsVisibility();
                        break;
                    case"minZoomLevel":
                    case"maxZoomLevel":
                        this._correctZoomLevel();
                        this._updateButtonsVisibility();
                        break;
                    case"value":
                        this._updateCurrentDate(value ? new Date(value) : new Date);
                        this._view.option("value", value ? new Date(value) : null);
                        this.callBase(args);
                        break;
                    case"disabled":
                        this._view.option("disabled", value);
                        this.callBase(args);
                        break;
                    case"showTodayButton":
                        this._invalidate();
                        break;
                    case"onCellClick":
                        this._view.option("onCellClick", value);
                        break;
                    case"onContouredChanged":
                        this.onContouredChanged = this._createActionByOption("onContouredChanged");
                        break;
                    case"cellTemplate":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.calendar.views.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            fx = DX.fx,
            events = ui.events,
            utils = DX.utils,
            CALENDAR_CLASS = "dx-calendar",
            CALENDAR_OTHER_MONTH_CLASS = "dx-calendar-other-month",
            CALENDAR_OTHER_VIEW_CLASS = "dx-calendar-other-view",
            CALENDAR_CELL_CLASS = "dx-calendar-cell",
            CALENDAR_EMPTY_CELL_CLASS = "dx-calendar-empty-cell",
            CALENDAR_TODAY_CLASS = "dx-calendar-today",
            CALENDAR_SELECTED_DATE_CLASS = "dx-calendar-selected-date",
            CALENDAR_CONTOURED_DATE_CLASS = "dx-calendar-contoured-date",
            CALENDAR_DXCLICK_EVENT_NAME = events.addNamespace("dxclick", "dxCalendar"),
            CALENDAR_DATE_VALUE_KEY = "dxDateValueKey",
            CALENDAR_VIEW_NAME_PREFIX = "CalendarView";
        ui.dxCalendar.BaseView = ui.Widget.inherit({
            NAME: CALENDAR_VIEW_NAME_PREFIX + "Base",
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    date: new Date,
                    focusStateEnabled: false,
                    cellTemplate: null,
                    onCellClick: null,
                    rowCount: 3,
                    colCount: 4,
                    allowValueSelection: true,
                    onValueChanged: null,
                    onContouredDateChanged: null
                })
            },
            _init: function() {
                this.callBase();
                var value = this.option("value"),
                    contouredDate = this.option("contouredDate");
                if (contouredDate)
                    this.option("contouredDate", this._calculateContouredDate(contouredDate));
                this.option("value", new Date(value));
                if (!this.option("value").valueOf())
                    this.option("value", new Date(0, 0, 0, 0, 0, 0));
                this._initActions()
            },
            _initActions: function() {
                this._createCellClickOptionAction();
                this._createCellClickAction();
                this._valueChangedAction = this._createActionByOption("onValueChanged");
                this._contouredDateChangedAction = this._createActionByOption("onContouredDateChanged")
            },
            _render: function() {
                this.callBase();
                this._renderImpl()
            },
            _renderImpl: function() {
                this._$table = $("<table>");
                this._renderBody();
                this._renderContouredDate();
                this._renderValue();
                var cellClickAction = this._createAction($.proxy(function(e) {
                        this._cellClickHandler(e.jQueryEvent)
                    }, this));
                this._$table.off(CALENDAR_DXCLICK_EVENT_NAME).on(CALENDAR_DXCLICK_EVENT_NAME, "td", function(e) {
                    cellClickAction({jQueryEvent: e})
                });
                this.element().off("beforeactivate").on("beforeactivate", function(e) {
                    e.preventDefault()
                });
                this.element().append(this._$table)
            },
            _renderBody: function() {
                this.$body = $("<tbody>").appendTo(this._$table);
                var that = this,
                    cellTemplate = this.option("cellTemplate");
                for (var indexRow = 0, len = this.option("rowCount"); indexRow < len; indexRow++) {
                    var $row = $("<tr>").appendTo(this.$body);
                    this._iterateCells(function(cellIndex) {
                        var cellDate = that._getCellData(indexRow, cellIndex);
                        var $cell = $("<td>").appendTo($row).addClass(CALENDAR_CELL_CLASS).toggleClass(CALENDAR_TODAY_CLASS, that._isTodayCell(cellDate)).toggleClass(CALENDAR_EMPTY_CELL_CLASS, that._isDateOutOfRange(cellDate)).toggleClass(CALENDAR_OTHER_VIEW_CLASS, that._isOtherView(cellDate)).attr("data-value", utils.getShortDate(cellDate)).data(CALENDAR_DATE_VALUE_KEY, cellDate);
                        that.setAria({
                            role: "option",
                            label: that._getCellAriaLabel(cellDate)
                        }, $cell);
                        if (cellTemplate)
                            cellTemplate.render({text: that._getCellText(cellDate)}, $cell, cellIndex);
                        else
                            $cell.text(that._getCellText(cellDate))
                    })
                }
            },
            _iterateCells: function(delegate) {
                var rtl = this.option("rtl"),
                    colCount = this.option("colCount"),
                    i = rtl ? colCount - 1 : 0;
                while (rtl ? i >= 0 : i < colCount) {
                    delegate(i);
                    rtl ? --i : ++i
                }
            },
            _isTodayCell: DX.abstract,
            _isDateOutOfRange: DX.abstract,
            _isOtherView: DX.abstract,
            _getCellText: DX.abstract,
            _getCellData: DX.abstract,
            _supportedKeys: function() {
                this._difference = utils.getDifferenceInMonthForCells(this._getViewName());
                return $.extend(this.callBase(), {
                        leftArrow: this._leftArrowHandler,
                        rightArrow: this._rightArrowHandler,
                        upArrow: this._upArrowHandler,
                        downArrow: this._downArrowHandler,
                        enter: this._enterHandler,
                        home: this._homeHandler,
                        end: this._endHandler
                    })
            },
            _homeHandler: function(e) {
                e.preventDefault();
                var date = this.option("date"),
                    currentView = this._getViewName();
                if (utils[DX.inflector.camelize("same " + currentView)](date, new Date(this.option("min")))) {
                    var $cell = this.$body.find("." + CALENDAR_CELL_CLASS).not("." + CALENDAR_EMPTY_CELL_CLASS).first();
                    this.option("contouredDate", $cell.data(CALENDAR_DATE_VALUE_KEY))
                }
                else
                    this.option("contouredDate", utils.getFirstDateView(currentView, date));
                this._renderContouredDate()
            },
            _endHandler: function(e) {
                e.preventDefault();
                var date = this.option("date"),
                    currentView = this._getViewName();
                if (utils[DX.inflector.camelize("same " + currentView)](date, new Date(this.option("max")))) {
                    var $cell = this.$body.find("." + CALENDAR_CELL_CLASS).not("." + CALENDAR_EMPTY_CELL_CLASS).last();
                    this.option("contouredDate", $cell.data(CALENDAR_DATE_VALUE_KEY))
                }
                else
                    this.option("contouredDate", utils.getLastDateView(currentView, date));
                this._renderContouredDate()
            },
            _getViewName: function() {
                var startPos = CALENDAR_VIEW_NAME_PREFIX.length,
                    name = this.NAME;
                name = name.substr(startPos, name.length);
                return name.toLowerCase()
            },
            _leftArrowHandler: function(e) {
                e.preventDefault();
                this.moveContouredDate(this.option("rtl") ? 1 * this._difference : -1 * this._difference)
            },
            _rightArrowHandler: function(e) {
                e.preventDefault();
                this.moveContouredDate(this.option("rtl") ? -1 * this._difference : 1 * this._difference)
            },
            _upArrowHandler: function(e) {
                e.preventDefault();
                this.moveContouredDate(-this.option("colCount") * this._difference)
            },
            _downArrowHandler: function(e) {
                e.preventDefault();
                this.moveContouredDate(this.option("colCount") * this._difference)
            },
            _enterHandler: function() {
                this.option("value", this.option("contouredDate"))
            },
            _renderContouredDate: function() {
                if (!this.option("focusStateEnabled"))
                    return;
                var contouredDate = this.option("contouredDate"),
                    $oldContouredCell = this._$table.find("." + CALENDAR_CONTOURED_DATE_CLASS),
                    $newContouredCell = this._getCellByDate(contouredDate);
                $oldContouredCell.removeClass(CALENDAR_CONTOURED_DATE_CLASS);
                $newContouredCell.addClass(CALENDAR_CONTOURED_DATE_CLASS);
                this._ariaId = new DevExpress.data.Guid;
                this.setAria({
                    id: undefined,
                    selected: undefined
                }, $oldContouredCell);
                this.setAria({
                    id: this._ariaId,
                    selected: true
                }, $newContouredCell)
            },
            _dispose: function() {
                this._keyboardProcessor = undefined;
                this.callBase()
            },
            _createCellClickOptionAction: function() {
                this._cellClickOptionAction = this._createActionByOption("onCellClick")
            },
            _cellClickHandler: function(e) {
                this._cellClickAction({jQueryEvent: e})
            },
            _createCellClickAction: function(e) {
                this._cellClickAction = this._createAction($.proxy(function(e) {
                    var $currentTarget = $(e.jQueryEvent.currentTarget);
                    if (!$currentTarget.hasClass(CALENDAR_EMPTY_CELL_CLASS)) {
                        var cellDate = $currentTarget.data(CALENDAR_DATE_VALUE_KEY);
                        this._changeValue(cellDate);
                        this._cellClickOptionAction(e)
                    }
                }, this))
            },
            _fitContouredCell: function(value, prevValue) {
                var $cell = this._getCellByDate(utils.getShortDate(value));
                if ($cell.hasClass(CALENDAR_EMPTY_CELL_CLASS))
                    this.option("contouredDate", prevValue)
            },
            _changeValue: function(cellDate) {
                if (cellDate) {
                    var value = this.option("value"),
                        newValue = value ? new Date(value) : new Date;
                    newValue.setDate(cellDate.getDate());
                    newValue.setMonth(cellDate.getMonth());
                    newValue.setFullYear(cellDate.getFullYear());
                    newValue.setDate(cellDate.getDate());
                    this.option("value", newValue)
                }
                else
                    this.option("value", null)
            },
            _renderValue: function() {
                if (!this.option("allowValueSelection"))
                    return;
                var value = this.option("value"),
                    selectedCell = this._getCellByDate(value);
                if (this._selectedCell)
                    this._selectedCell.removeClass(CALENDAR_SELECTED_DATE_CLASS);
                selectedCell.addClass(CALENDAR_SELECTED_DATE_CLASS);
                this._selectedCell = selectedCell
            },
            _getCellAriaLabel: $.noop,
            getNextCircledDate: function(difference) {
                var circledDate = this.option("contouredDate") && new Date(this.option("contouredDate"));
                if (circledDate)
                    circledDate.setMonth(circledDate.getMonth() + difference);
                return circledDate
            },
            focusInHandler: DX.abstract,
            canNavigate: DX.abstract,
            moveContouredDate: DX.abstract,
            isBoundary: DX.abstract,
            _optionChanged: function(args) {
                var name = args.name;
                switch (name) {
                    case"value":
                        this.option("contouredDate", args.value);
                        this._renderValue();
                        this._valueChangedAction({
                            jQueryEvent: undefined,
                            value: args.value,
                            previousValue: args.previousValue
                        });
                        break;
                    case"contouredDate":
                        this._fitContouredCell(args.value, args.previousValue);
                        this._renderContouredDate();
                        this._contouredDateChangedAction({
                            jQueryEvent: undefined,
                            value: args.value,
                            previousValue: args.previousValue,
                            ariaId: this._ariaId
                        });
                        break;
                    case"onCellClick":
                        this._createCellClickOptionAction();
                        break;
                    case"cellTemplate":
                        this._invalidate();
                        break;
                    case"onValueChanged":
                    case"onContouredDateChanged":
                        break;
                    default:
                        this.callBase(args)
                }
            }
        });
        ui.dxCalendar.views = {
            month: ui.dxCalendar.BaseView.inherit({
                NAME: CALENDAR_VIEW_NAME_PREFIX + "Month",
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({
                        firstDayOfWeek: undefined,
                        rowCount: 6,
                        colCount: 7
                    })
                },
                _renderImpl: function() {
                    this.callBase();
                    this._renderHeader()
                },
                _renderBody: function() {
                    this.callBase();
                    this._$table.find("." + CALENDAR_OTHER_VIEW_CLASS).addClass(CALENDAR_OTHER_MONTH_CLASS)
                },
                _renderFocusTarget: $.noop,
                _getCellAriaLabel: function(date) {
                    return Globalize.format(date, "D")
                },
                _renderHeader: function() {
                    var that = this,
                        $header = $("<thead>").prependTo(this._$table),
                        $headerRow = $("<tr>").appendTo($header);
                    this._iterateCells(function(i) {
                        $("<th>").text(that._getDayCaption(that._getFirstDayOfWeek() + i)).appendTo($headerRow)
                    })
                },
                _getNavigatorCaption: function() {
                    var navigatorMonth = Globalize.culture().calendar.months.names[this.option("date").getMonth()],
                        navigatorYear = this.option("date").getFullYear();
                    return this.option("rtl") ? navigatorYear + " " + navigatorMonth : navigatorMonth + " " + navigatorYear
                },
                _isTodayCell: function(cellDate) {
                    var today = new Date;
                    return utils.sameMonthAndYear(cellDate, today) && cellDate.getDate() === today.getDate()
                },
                _isDateOutOfRange: function(cellDate) {
                    var minDate = this.option("min"),
                        maxDate = this.option("max");
                    return !utils.dateInRange(cellDate, minDate, maxDate)
                },
                _isOtherView: function(cellDate) {
                    return cellDate.getMonth() !== this.option("date").getMonth()
                },
                _getCellText: function(cellDate) {
                    return cellDate.getDate()
                },
                _getDayCaption: function(day) {
                    var daysInWeek = this.option("colCount");
                    return Globalize.culture().calendar.days.namesAbbr[day % daysInWeek]
                },
                _getCellData: function(week, day) {
                    var firstDay = utils.getFirstMonthDate(this.option("date")),
                        firstMonthDayPosition = firstDay.getDay() - this._getFirstDayOfWeek(),
                        daysInWeek = this.option("colCount"),
                        firstWeekDay = daysInWeek * week - firstMonthDayPosition;
                    firstWeekDay = firstMonthDayPosition < 0 ? firstWeekDay - daysInWeek : firstWeekDay;
                    firstDay.setDate(firstDay.getDate() + firstWeekDay + day);
                    return firstDay
                },
                _getFirstDayOfWeek: function() {
                    return this.option("firstDayOfWeek") || Globalize.culture().calendar.firstDay
                },
                moveContouredDate: function(difference) {
                    var contouredDate = this._calculateContouredDate(this.option("contouredDate")),
                        newContouredDate = new Date(contouredDate.getFullYear(), contouredDate.getMonth(), contouredDate.getDate() + difference);
                    utils.fixTimezoneGap(contouredDate, newContouredDate);
                    this.option("contouredDate", newContouredDate)
                },
                _calculateContouredDate: function(contouredDate) {
                    var calculatedContouredDate = null,
                        date = this.option("date"),
                        value = this.option("value");
                    if (utils.sameMonthAndYear(contouredDate, date))
                        calculatedContouredDate = contouredDate;
                    else if (utils.sameMonthAndYear(value, date))
                        calculatedContouredDate = value;
                    return calculatedContouredDate || utils.getFirstMonthDate(date)
                },
                focusInHandler: function() {
                    this.option("contouredDate", this._calculateContouredDate(this.option("contouredDate")))
                },
                canNavigate: function(difference) {
                    var date = new Date(this.option("date"));
                    var testCurrentDate = difference < 0 ? new Date(date.getFullYear(), date.getMonth() + difference + 1, 0) : new Date(date.getFullYear(), date.getMonth() + difference, 1);
                    return utils.dateInRange(testCurrentDate, this.option("min"), this.option("max"))
                },
                _getCellByDate: function(date) {
                    return this._$table.find("td[data-value='" + utils.getShortDate(date) + "']")
                },
                isBoundary: function(date) {
                    return utils.sameMonthAndYear(date, this.option("min")) || utils.sameMonthAndYear(date, this.option("max"))
                },
                getNextCircledDate: function(difference) {
                    var circledDate = this.option("contouredDate") && new Date(this.option("contouredDate"));
                    if (circledDate) {
                        var currentDay = circledDate.getDate();
                        circledDate.setDate(1);
                        circledDate.setMonth(circledDate.getMonth() + difference);
                        var lastDayMonth = utils.getLastMonthDate(circledDate).getDate();
                        currentDay > lastDayMonth ? circledDate.setDate(lastDayMonth) : circledDate.setDate(currentDay)
                    }
                    return circledDate
                },
                getCircledDate: function(currentDate, contouredStack) {
                    var lastContour = contouredStack.pop(),
                        day = lastContour.getDate(),
                        circled = new Date(currentDate);
                    circled.setDate(day);
                    return circled
                }
            }),
            year: ui.dxCalendar.BaseView.inherit({
                NAME: CALENDAR_VIEW_NAME_PREFIX + "Year",
                _isTodayCell: function(cellDate) {
                    return utils.sameMonthAndYear(cellDate, new Date)
                },
                _isDateOutOfRange: function(cellDate) {
                    return !utils.dateInRange(cellDate, utils.getFirstMonthDate(this.option("min")), utils.getLastMonthDate(this.option("max")))
                },
                _isOtherView: function(cellDate) {
                    return false
                },
                _getCellText: function(cellDate) {
                    return Globalize.culture().calendar.months.names[cellDate.getMonth()].slice(0, 3)
                },
                _getCellData: function(indexRow, cellIndex) {
                    var data = new Date(this.option("date")),
                        colCount = this.option("colCount");
                    data.setDate(1);
                    data.setMonth(indexRow * colCount + cellIndex);
                    return data
                },
                _getCellByDate: function(date) {
                    var foundDate = new Date(date);
                    foundDate.setDate(1);
                    return this._$table.find("td[data-value='" + utils.getShortDate(foundDate) + "']")
                },
                _getCellAriaLabel: function(date) {
                    return Globalize.format(date, "Y")
                },
                _getNavigatorCaption: function() {
                    return this.option("date").getFullYear()
                },
                moveContouredDate: function(difference) {
                    var contouredDate = this.option("contouredDate") || this.option("date"),
                        newContouredDate = new Date(contouredDate.getFullYear(), contouredDate.getMonth() + difference, contouredDate.getDate());
                    utils.fixTimezoneGap(contouredDate, newContouredDate);
                    this.option("contouredDate", newContouredDate)
                },
                focusInHandler: function() {
                    var date = this.option("date");
                    this.option("contouredDate", new Date(date.getFullYear(), date.getMonth(), 1))
                },
                canNavigate: function(difference) {
                    var date = new Date(this.option("date"));
                    var testCurrentDate = difference < 0 ? new Date(date.getFullYear() - 1, 11, 31) : new Date(date.getFullYear() + 1, 1, 1);
                    return utils.dateInRange(testCurrentDate, this.option("min"), this.option("max"))
                },
                isBoundary: function(date) {
                    return utils.sameYear(date, this.option("min")) || utils.sameYear(date, this.option("max"))
                },
                getCircledDate: function(currentDate, contouredStack) {
                    var lastContour = contouredStack.pop(),
                        month = lastContour.getMonth(),
                        circled = new Date(currentDate);
                    circled.setMonth(month);
                    circled.setDate(1);
                    return circled
                }
            }),
            decade: ui.dxCalendar.BaseView.inherit({
                NAME: CALENDAR_VIEW_NAME_PREFIX + "Decade",
                _isTodayCell: function(cellDate) {
                    return utils.sameYear(cellDate, new Date)
                },
                _isDateOutOfRange: function(cellDate) {
                    var min = this.option("min"),
                        max = this.option("max");
                    return !utils.dateInRange(cellDate.getFullYear(), min && min.getFullYear(), max && max.getFullYear())
                },
                _isOtherView: function(cellDate) {
                    var date = new Date(cellDate);
                    date.setMonth(1);
                    return !utils.sameDecade(date, this.option("date"))
                },
                _getCellText: function(cellDate) {
                    return cellDate.getFullYear()
                },
                _getCellData: function(indexRow, cellIndex) {
                    var colCount = this.option("colCount"),
                        year = utils.getFirstYearInDecade(this.option("date")) - 1 + indexRow * colCount + cellIndex;
                    return new Date(year, 0, 1)
                },
                _getCellAriaLabel: function(date) {
                    return this._getCellText(date)
                },
                _getNavigatorCaption: function() {
                    var year = utils.getFirstYearInDecade(this.option("date"));
                    return year + "-" + (year + 9)
                },
                moveContouredDate: function(difference) {
                    var contouredDate = new Date(this.option("contouredDate") || this.option("date"));
                    contouredDate.setMonth(0);
                    var newContouredDate = new Date(contouredDate.getFullYear(), contouredDate.getMonth() + difference, contouredDate.getDate());
                    utils.fixTimezoneGap(contouredDate, newContouredDate);
                    this.option("contouredDate", newContouredDate)
                },
                focusInHandler: function() {
                    var date = this.option("date");
                    this.option("contouredDate", new Date(date.getFullYear(), 0, 1))
                },
                _getCellByDate: function(date) {
                    var foundDate = new Date(date);
                    foundDate.setDate(1);
                    foundDate.setMonth(0);
                    return this._$table.find("td[data-value='" + utils.getShortDate(foundDate) + "']")
                },
                canNavigate: function(difference) {
                    var date = new Date(this.option("date"));
                    var testCurrentDate = difference < 0 ? new Date(utils.getFirstYearInDecade(date) - 1, 11, 31) : new Date(utils.getFirstYearInDecade(date) + 10, 1, 1);
                    return utils.dateInRange(testCurrentDate, this.option("min"), this.option("max"))
                },
                isBoundary: function(date) {
                    return utils.sameDecade(date, this.option("min")) || utils.sameDecade(date, this.option("max"))
                },
                getCircledDate: function(currentDate, contouredStack) {
                    var lastContour = contouredStack.pop(),
                        year = lastContour.getFullYear(),
                        circled = new Date(currentDate);
                    circled.setFullYear(circled.getFullYear() + year % 10);
                    circled.setMonth(0);
                    circled.setDate(1);
                    return circled
                }
            }),
            century: ui.dxCalendar.BaseView.inherit({
                NAME: CALENDAR_VIEW_NAME_PREFIX + "Century",
                _isTodayCell: function(cellDate) {
                    return utils.sameDecade(cellDate, new Date)
                },
                _isDateOutOfRange: function(cellDate) {
                    var decade = utils.getFirstYearInDecade(cellDate),
                        minDecade = utils.getFirstYearInDecade(this.option("min")),
                        maxDecade = utils.getFirstYearInDecade(this.option("max"));
                    return !utils.dateInRange(decade, minDecade, maxDecade)
                },
                _isOtherView: function(cellDate) {
                    var date = new Date(cellDate);
                    date.setMonth(1);
                    return !utils.sameCentury(date, this.option("date"))
                },
                _getCellText: function(cellDate) {
                    var decade = cellDate.getFullYear();
                    return decade + " - " + (decade + 9)
                },
                _getCellData: function(indexRow, cellIndex) {
                    var colCount = this.option("colCount"),
                        decade = utils.getFirstDecadeInCentury(this.option("date")) + (-1 + indexRow * colCount + cellIndex) * 10;
                    return new Date(decade, 0, 1)
                },
                _getCellAriaLabel: function(date) {
                    return this._getCellText(date)
                },
                _getCellByDate: function(date) {
                    var foundDate = new Date(date);
                    foundDate.setDate(1);
                    foundDate.setMonth(0);
                    foundDate.setFullYear(utils.getFirstYearInDecade(foundDate));
                    return this._$table.find("td[data-value='" + utils.getShortDate(foundDate) + "']")
                },
                _getNavigatorCaption: function() {
                    var decade = utils.getFirstDecadeInCentury(this.option("date"));
                    return decade + "-" + (decade + 99)
                },
                moveContouredDate: function(difference) {
                    var contouredDate = this._calculateContouredDate(this.option("contouredDate")),
                        newContouredDate = new Date(contouredDate.getFullYear(), contouredDate.getMonth() + difference, contouredDate.getDate());
                    utils.fixTimezoneGap(contouredDate, newContouredDate);
                    this.option("contouredDate", newContouredDate)
                },
                _calculateContouredDate: function(contouredDate) {
                    var calculatedContouredDate = null;
                    if (!utils.isDefined(contouredDate)) {
                        var date = this.option("date");
                        calculatedContouredDate = new Date(date);
                        calculatedContouredDate.setFullYear(utils.getFirstYearInDecade(date));
                        calculatedContouredDate.setDate(1)
                    }
                    else {
                        calculatedContouredDate = new Date(contouredDate);
                        calculatedContouredDate.setFullYear(utils.getFirstYearInDecade(this.option("contouredDate")))
                    }
                    calculatedContouredDate.setMonth(0);
                    return calculatedContouredDate
                },
                focusInHandler: function() {
                    var date = this.option("date");
                    this.option("contouredDate", new Date(utils.getFirstYearInDecade(date), 0, 1))
                },
                canNavigate: function(difference) {
                    var date = new Date(this.option("date"));
                    var testCurrentDate = difference < 0 ? new Date(utils.getFirstDecadeInCentury(date) - 1, 11, 31) : new Date(utils.getFirstDecadeInCentury(date) + 100, 1, 1);
                    return utils.dateInRange(testCurrentDate, this.option("min"), this.option("max"))
                },
                isBoundary: function(date) {
                    return utils.sameCentury(date, this.option("min")) || utils.sameCentury(date, this.option("max"))
                }
            })
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.calendar.navigator.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events,
            CALENDAR_NAVIGATOR_CLASS = "dx-calendar-navigator",
            CALENDAR_NAVIGATOR_PREVIOUS_MONTH_CLASS = "dx-calendar-navigator-previous-month",
            CALENDAR_NAVIGATOR_NEXT_MONTH_CLASS = "dx-calendar-navigator-next-month",
            CALENDAR_NAVIGATOR_PREVIOUS_VIEW_CLASS = "dx-calendar-navigator-previous-view",
            CALENDAR_NAVIGATOR_NEXT_VIEW_CLASS = "dx-calendar-navigator-next-view",
            CALENDAR_NAVIGATOR_DISABLED_LINK_CLASS = "dx-calendar-disabled-navigator-link",
            CALENDAR_NAVIGATOR_CAPTION_BUTTON_CLASS = "dx-calendar-caption-button";
        ui.dxCalendar.Navigator = ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    onClick: null,
                    onCaptionClick: null,
                    text: ""
                })
            },
            _init: function() {
                this.callBase();
                this._initActions()
            },
            _initActions: function() {
                this._clickAction = this._createActionByOption("onClick");
                this._captionClickAction = this._createActionByOption("onCaptionClick")
            },
            _render: function() {
                this.callBase();
                this.element().addClass(CALENDAR_NAVIGATOR_CLASS);
                this._renderButtons();
                this._renderCaption()
            },
            _renderButtons: function() {
                var that = this,
                    direction = this.option("rtlEnabled") ? -1 : 1;
                this._prevButton = this._createComponent($("<a>"), "dxButton", {
                    focusStateEnabled: false,
                    icon: "chevronleft",
                    onClick: function(e) {
                        that._clickAction({
                            direction: -direction,
                            jQueryEvent: e
                        })
                    }
                });
                var $prevButton = this._prevButton.element().addClass(CALENDAR_NAVIGATOR_PREVIOUS_VIEW_CLASS).addClass(CALENDAR_NAVIGATOR_PREVIOUS_MONTH_CLASS);
                this._nextButton = this._createComponent($("<a>"), "dxButton", {
                    focusStateEnabled: false,
                    icon: "chevronright",
                    onClick: function(e) {
                        that._clickAction({
                            direction: direction,
                            jQueryEvent: e
                        })
                    }
                });
                var $nextButton = this._nextButton.element().addClass(CALENDAR_NAVIGATOR_NEXT_VIEW_CLASS).addClass(CALENDAR_NAVIGATOR_NEXT_MONTH_CLASS);
                this._caption = this._createComponent($("<a>").addClass(CALENDAR_NAVIGATOR_CAPTION_BUTTON_CLASS), "dxButton", {
                    focusStateEnabled: false,
                    onClick: function(e) {
                        that._captionClickAction({jQueryEvent: e})
                    }
                });
                var $caption = this._caption.element();
                this.element().append($prevButton, $caption, $nextButton)
            },
            _renderCaption: function(caption) {
                this._caption.option("text", this.option("text"))
            },
            toggleButton: function(button, value) {
                var buttonName = "_" + button + "Button",
                    button = this[buttonName];
                if (button) {
                    button.option("disabled", value);
                    button.element().toggleClass(CALENDAR_NAVIGATOR_DISABLED_LINK_CLASS, value)
                }
            },
            _optionChanged: function(args) {
                var value = args.value;
                switch (args.name) {
                    case"text":
                        this._renderCaption(value);
                        break;
                    default:
                        this.callBase(args)
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.timeView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            browser = DX.browser,
            isBuggyIE = browser.msie && browser.version.split(".")[0] == 8;
        var TIMEVIEW_CLASS = "dx-timeview",
            TIMEVIEW_CLOCK_CLASS = "dx-timeview-clock",
            TIMEVIEW_FIELD_CLASS = "dx-timeview-field",
            TIMEVIEW_HOURARROW_CLASS = "dx-timeview-hourarrow",
            TIMEVIEW_MINUTEARROW_CLASS = "dx-timeview-minutearrow";
        var rotateArrow = function($arrow, angle, offset) {
                if (isBuggyIE)
                    filterRotate($arrow, angle, offset);
                else
                    cssRotate($arrow, angle, offset)
            };
        var filterRotate = function($arrow, angle, offset) {
                angle = angle / 180 * Math.PI;
                var sin = Math.sin(angle),
                    cos = Math.cos(angle);
                $arrow.css("filter", "none");
                var originalWidth = $arrow.width(),
                    originalHeight = $arrow.height();
                $arrow.css("filter", 'progid:DXImageTransform.Microsoft.Matrix' + '(sizingMethod="auto expand", M11 = ' + cos + ', M12 = ' + -sin + ', M21 = ' + sin + ', M22 = ' + cos + ')');
                var width = $arrow.width(),
                    height = $arrow.height();
                var sx = (width - originalWidth) / 2,
                    sy = (height - originalHeight) / 2;
                $arrow.css("margin-left", -originalWidth / 2 + (originalHeight / 2 - offset) * sin - sx);
                $arrow.css("margin-top", originalHeight / 2 - (originalHeight / 2 - offset) * cos - sy)
            };
        var cssRotate = function($arrow, angle, offset) {
                $arrow.css("transform", "rotate(" + angle + "deg)" + " translate(0," + offset + "px)")
            };
        DX.registerComponent("dxTimeView", ui, ui.Editor.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: new Date($.now()),
                    _arrowOffset: 0
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "android"},
                            options: {_arrowOffset: 15}
                        }, {
                            device: {platform: "generic"},
                            options: {_arrowOffset: 5}
                        }])
            },
            _getValue: function() {
                return this.option("value") || new Date
            },
            _init: function() {
                this.callBase();
                this.element().addClass(TIMEVIEW_CLASS)
            },
            _render: function() {
                this.callBase();
                this._renderBox();
                this._updateTime()
            },
            _renderBox: function() {
                var $box = $("<div>").appendTo(this.element());
                this._createComponent($box, "dxBox", {
                    height: "100%",
                    width: "100%",
                    direction: "col",
                    items: [{
                            ratio: 1,
                            baseSize: "auto",
                            template: $.proxy(this._renderClock, this)
                        }, {
                            ratio: 0,
                            baseSize: 50,
                            template: $.proxy(this._renderField, this)
                        }]
                })
            },
            _renderClock: function(_, __, $container) {
                this._$hourArrow = $("<div>").addClass(TIMEVIEW_HOURARROW_CLASS);
                this._$minuteArrow = $("<div>").addClass(TIMEVIEW_MINUTEARROW_CLASS);
                $container.addClass(TIMEVIEW_CLOCK_CLASS).append(this._$hourArrow).append(this._$minuteArrow);
                this.setAria("role", "presentation", $container)
            },
            _updateClock: function() {
                var time = this._getValue(),
                    hourArrowAngle = time.getHours() / 12 * 360 + time.getMinutes() / 60 * 30,
                    minuteArrowAngle = time.getMinutes() / 60 * 360;
                rotateArrow(this._$hourArrow, hourArrowAngle, this.option("_arrowOffset"));
                rotateArrow(this._$minuteArrow, minuteArrowAngle, this.option("_arrowOffset"))
            },
            _renderField: function() {
                this._createHourBox();
                this._createMinuteBox();
                return this._createComponent($("<div>").addClass(TIMEVIEW_FIELD_CLASS), "dxBox", {
                        direction: "row",
                        align: "center",
                        crossAlign: "center",
                        items: [{
                                ratio: 0,
                                baseSize: "auto",
                                template: $.proxy(function() {
                                    return this._hourBox.element()
                                }, this)
                            }, {
                                ratio: 0,
                                baseSize: "auto",
                                template: Globalize.culture().calendar[":"]
                            }, {
                                ratio: 0,
                                baseSize: "auto",
                                template: $.proxy(function() {
                                    return this._minuteBox.element()
                                }, this)
                            }]
                    }).element()
            },
            _createHourBox: function() {
                this._hourBox = this._createComponent($("<div>"), "dxNumberBox", $.extend({
                    min: -1,
                    max: 24,
                    value: this._getValue().getHours(),
                    onValueChanged: $.proxy(function(args) {
                        var newHours = (24 + args.value) % 24;
                        this._hourBox.option("value", newHours);
                        var time = new Date(this._getValue());
                        time.setHours(newHours);
                        this.option("value", time)
                    }, this)
                }, this._getNumberBoxConfig()));
                this._hourBox.setAria("label", "hours")
            },
            _createMinuteBox: function() {
                this._minuteBox = this._createComponent($("<div>"), "dxNumberBox", $.extend({
                    min: -1,
                    max: 60,
                    value: this._getValue().getMinutes(),
                    onValueChanged: $.proxy(function(args) {
                        var newMinutes = (60 + args.value) % 60;
                        this._minuteBox.option("value", newMinutes);
                        var time = new Date(this._getValue());
                        time.setMinutes(newMinutes);
                        this.option("value", time)
                    }, this)
                }, this._getNumberBoxConfig()));
                this._minuteBox.setAria("label", "minutes")
            },
            _getNumberBoxConfig: function() {
                return {
                        showSpinButtons: true,
                        disabled: this.option("disabled"),
                        valueFormat: function(value) {
                            return (value < 10 ? "0" : "") + value
                        }
                    }
            },
            _updateField: function() {
                this._hourBox && this._hourBox.option("value", this._getValue().getHours());
                this._minuteBox && this._minuteBox.option("value", this._getValue().getMinutes())
            },
            _updateTime: function() {
                this._updateClock();
                this._updateField()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._updateTime()
            },
            _toggleDisabledState: function(value) {
                this._hourBox && this._hourBox.option("disabled", value);
                this._minuteBox && this._minuteBox.option("disabled", value)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"value":
                        this._updateTime();
                        this.callBase(args);
                        break;
                    case"_arrowOffset":
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateView.js */
    (function($, DX) {
        var ui = DX.ui,
            events = ui.events,
            dateUtils = ui.dateUtils,
            DATEVIEW_CLASS = "dx-dateview",
            DATEVIEW_WRAPPER_CLASS = "dx-dateview-wrapper",
            DATEVIEW_ROLLER_CONTAINER_CLASS = "dx-dateview-rollers",
            DATEVIEW_ROLLER_CLASS = "dx-dateviewroller",
            DATEVIEW_ROLLER_ACTIVE_CLASS = "dx-state-active",
            DATEVIEW_ROLLER_CURRENT_CLASS = "dx-dateviewroller-current",
            DATEVIEW_ROLLER_ITEM_CLASS = "dx-dateview-item",
            DATEVIEW_ROLLER_ITEM_SELECTED_CLASS = "dx-dateview-item-selected",
            DATEVIEW_ROLLER_ITEM_SELECTED_FRAME_CLASS = "dx-dateview-item-selected-frame",
            DATEVIEW_ROLLER_ITEM_SELECTED_BORDER_CLASS = "dx-dateview-item-selected-border",
            DATEVIEW_ROLLER_BUTTON_UP_CLASS = "dx-dateview-button-up",
            DATEVIEW_ROLLER_BUTTON_DOWN_CLASS = "dx-dateview-button-down";
        DX.registerComponent("dxDateViewRoller", ui, ui.dxScrollable.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    clickableItems: false,
                    showScrollbar: false,
                    useNative: false,
                    selectedIndex: 0,
                    bounceEnabled: false,
                    items: [],
                    onClick: null,
                    showOnClick: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {
                                clickableItems: true,
                                showOnClick: true
                            }
                        }, {
                            device: {platform: "generic"},
                            options: {scrollByContent: true}
                        }])
            },
            _init: function() {
                this.callBase();
                this._renderSelectedItemFrame();
                this._renderControlButtons()
            },
            _render: function() {
                this.callBase();
                $.each(this._strategy._scrollers, function(index, scroller) {
                    scroller._correctLocation = $.noop
                });
                this.element().addClass(DATEVIEW_ROLLER_CLASS);
                this._renderContainerClick();
                this._renderItems();
                this._renderSelectedValue();
                this._renderItemsClick();
                this._wrapAction("_endAction", $.proxy(this._endActionHandler, this))
            },
            _renderContainerClick: function() {
                if (!this.option("showOnClick"))
                    return;
                var that = this,
                    eventName = events.addNamespace("dxclick", this.NAME);
                var clickAction = this._createActionByOption("onClick");
                this._$container.off(eventName).on(eventName, function(e) {
                    clickAction({jQueryEvent: e})
                })
            },
            _wrapAction: function(actionName, callback) {
                var strategy = this._strategy,
                    originalAction = strategy[actionName];
                strategy[actionName] = function() {
                    callback.apply(this, arguments);
                    return originalAction.apply(this, arguments)
                }
            },
            _renderItems: function() {
                var items = this.option("items") || [],
                    $items = $();
                this._$content.empty();
                $.each(items, function() {
                    $items = $items.add($("<div>").addClass(DATEVIEW_ROLLER_ITEM_CLASS).append(this))
                });
                this._$content.append($items);
                this._$items = $items;
                this.update()
            },
            _renderSelectedItemFrame: function() {
                $("<div>").addClass(DATEVIEW_ROLLER_ITEM_SELECTED_FRAME_CLASS).append($("<div>").addClass(DATEVIEW_ROLLER_ITEM_SELECTED_BORDER_CLASS)).appendTo(this._$container)
            },
            _renderControlButtons: function() {
                this._createComponent($("<div>").addClass(DATEVIEW_ROLLER_BUTTON_UP_CLASS).insertAfter(this._$container), "dxButton", {onClick: $.proxy(this._upButtonClickHandler, this)});
                this._createComponent($("<div>").addClass(DATEVIEW_ROLLER_BUTTON_DOWN_CLASS).insertAfter(this._$container), "dxButton", {onClick: $.proxy(this._downButtonClickHandler, this)})
            },
            _renderSelectedValue: function(selectedIndex) {
                if (selectedIndex === undefined)
                    selectedIndex = this.option("selectedIndex");
                selectedIndex = this._fitIndex(selectedIndex);
                var correctedPosition = this._getItemPosition(selectedIndex);
                this.option().selectedIndex = selectedIndex;
                this._moveTo({top: correctedPosition});
                this._renderActiveStateItem()
            },
            _fitIndex: function(index) {
                var items = this.option("items") || [],
                    itemCount = items.length;
                if (index >= itemCount)
                    return itemCount - 1;
                if (index < 0)
                    return 0;
                return index
            },
            _renderItemsClick: function() {
                var itemSelector = "." + DATEVIEW_ROLLER_ITEM_CLASS,
                    eventName = events.addNamespace("dxclick", this.NAME);
                this.element().off(eventName, itemSelector);
                if (this.option("clickableItems"))
                    this.element().on(eventName, itemSelector, $.proxy(this._itemClickHandler, this))
            },
            _itemClickHandler: function(e) {
                this._renderSelectedValue(this._itemElementIndex(this._closestItemElement(e)))
            },
            _itemElementIndex: function(itemElement) {
                return this._itemElements().index(itemElement)
            },
            _closestItemElement: function(e) {
                return e.currentTarget
            },
            _itemElements: function() {
                return this.element().find("." + DATEVIEW_ROLLER_ITEM_CLASS)
            },
            _renderActiveStateItem: function() {
                var selectedIndex = this.option("selectedIndex");
                $.each(this._$items, function(index) {
                    $(this).toggleClass(DATEVIEW_ROLLER_ITEM_SELECTED_CLASS, selectedIndex === index)
                })
            },
            _upButtonClickHandler: function() {
                this._animation = true;
                this.option("selectedIndex", this.option("selectedIndex") - 1)
            },
            _downButtonClickHandler: function() {
                this._animation = true;
                this.option("selectedIndex", this.option("selectedIndex") + 1)
            },
            _getItemPosition: function(index) {
                return Math.round(this._itemHeight() * index)
            },
            _moveTo: function(targetLocation) {
                targetLocation = this._normalizeLocation(targetLocation);
                var location = this._location(),
                    delta = {
                        x: -(location.left - targetLocation.left),
                        y: -(location.top - targetLocation.top)
                    };
                if (this._isVisible() && (delta.x || delta.y)) {
                    this._strategy._prepareDirections(true);
                    if (this._animation) {
                        DX.fx.stop(this._$content);
                        DX.fx.animate(this._$content, {
                            duration: 200,
                            type: "slide",
                            to: {top: targetLocation.top}
                        });
                        delete this._animation
                    }
                    else
                        this._strategy.handleMove({delta: delta})
                }
            },
            _validate: function(e) {
                return this._strategy.validate(e)
            },
            _endActionHandler: function() {
                if (this._changedByIndex) {
                    this._changedByIndex = false;
                    this._renderSelectedValue();
                    return
                }
                var ratio = -this._location().top / this._itemHeight(),
                    selectedIndex = Math.round(ratio);
                this._animation = true;
                this._renderSelectedValue(selectedIndex)
            },
            _itemHeight: function() {
                var $item = this._$items.first(),
                    height = $item.outerHeight() + parseFloat($item.css("margin-top") || 0);
                return height
            },
            _toggleActive: function(state) {
                this.element().toggleClass(DATEVIEW_ROLLER_ACTIVE_CLASS, state)
            },
            _isVisible: function() {
                return this._$container.is(":visible")
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"selectedIndex":
                        this._renderSelectedValue();
                        this._changedByIndex = true;
                        this._strategy.handleEnd({velocity: {
                                x: 0,
                                y: 0
                            }});
                        break;
                    case"items":
                        this._renderItems();
                        this._renderSelectedValue();
                        break;
                    case"clickableItems":
                        this._renderItemsClick();
                        break;
                    case"onClick":
                    case"showOnClick":
                        this._renderContainerClick();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }), ui);
        DX.registerComponent("dxDateView", ui, ui.Editor.inherit({
            _valueOption: function() {
                return new Date(this.option("value")) == "Invalid Date" ? new Date : new Date(this.option("value"))
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    minDate: new Date(1),
                    maxDate: new Date($.now() + dateUtils.TEN_YEARS),
                    format: "date",
                    value: new Date,
                    culture: Globalize.culture().name,
                    activeStateEnabled: true,
                    showNames: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {showNames: true}
                        }])
            },
            _render: function() {
                this.callBase();
                this.element().addClass(DATEVIEW_CLASS);
                this._toggleFormatClasses(this.option("format"))
            },
            _toggleFormatClasses: function(currentFormat, previousFormat) {
                this.element().addClass(DATEVIEW_CLASS + "-" + currentFormat);
                previousFormat && this.element().removeClass(DATEVIEW_CLASS + "-" + previousFormat)
            },
            _wrapper: function() {
                return this._$wrapper
            },
            _renderContentImpl: function() {
                this._$wrapper = $("<div>").appendTo(this.element()).addClass(DATEVIEW_WRAPPER_CLASS);
                this._renderRollers()
            },
            _renderRollers: function() {
                var that = this;
                if (!that._$rollersContainer)
                    that._$rollersContainer = $("<div>").appendTo(that._wrapper()).addClass(DATEVIEW_ROLLER_CONTAINER_CLASS);
                that._$rollersContainer.empty();
                that._createRollerConfigs();
                that._rollers = {};
                $.each(that._rollerConfigs, function(name) {
                    var $roller = $("<div>").appendTo(that._$rollersContainer).addClass(DATEVIEW_ROLLER_CLASS + "-" + that._rollerConfigs[name].type);
                    that._rollers[that._rollerConfigs[name].type] = that._createComponent($roller, "dxDateViewRoller", {
                        items: that._rollerConfigs[name].displayItems,
                        selectedIndex: that._rollerConfigs[name].selectedIndex,
                        showScrollbar: false,
                        onStart: function(e) {
                            var roller = e.component;
                            roller._toggleActive(true);
                            that._setActiveRoller(that._rollerConfigs[name], roller.option("selectedIndex"))
                        },
                        onEnd: function(e) {
                            var roller = e.component;
                            that._setRollerState(that._rollerConfigs[name], roller.option("selectedIndex"));
                            roller._toggleActive(false)
                        },
                        onClick: function(e) {
                            var roller = e.component;
                            roller._toggleActive(true);
                            that._setActiveRoller(that._rollerConfigs[name], roller.option("selectedIndex"));
                            that._setRollerState(that._rollerConfigs[name], roller.option("selectedIndex"));
                            roller._toggleActive(false)
                        }
                    })
                })
            },
            _setActiveRoller: function(currentRoller) {
                var activeRoller = currentRoller && this._rollers[currentRoller.type];
                $.each(this._rollers, function() {
                    this._$element.toggleClass(DATEVIEW_ROLLER_CURRENT_CLASS, this === activeRoller)
                })
            },
            _updateRollersPosition: function() {
                var that = this;
                $.each(this._rollers, function(type) {
                    var correctIndex = that._rollerConfigs[type].getIndex(that._getCurrentDate());
                    this.update();
                    this._renderSelectedValue(correctIndex)
                })
            },
            _setRollerState: function(roller, selectedIndex) {
                if (selectedIndex !== roller.selectedIndex) {
                    var rollerValue = roller.valueItems[selectedIndex],
                        setValue = roller.setValue,
                        currentValue = new Date(this._getCurrentDate()),
                        currentDate = currentValue.getDate();
                    if (roller.type === "month")
                        currentDate = Math.min(currentDate, dateUtils.getMaxMonthDay(currentValue.getFullYear(), rollerValue));
                    else if (roller.type === "year")
                        currentDate = Math.min(currentDate, dateUtils.getMaxMonthDay(rollerValue, currentValue.getMonth()));
                    currentValue.setDate(currentDate);
                    currentValue[setValue](rollerValue);
                    this.option("value", currentValue);
                    roller.selectedIndex = selectedIndex
                }
                if (roller.type === "year") {
                    this._refreshMonthRoller();
                    this._refreshDayRoller()
                }
                if (roller.type === "month")
                    this._refreshDayRoller()
            },
            _refreshMonthRoller: function() {
                var monthRoller = this._rollers["month"];
                if (monthRoller) {
                    this._createRollerConfig("month");
                    var monthRollerConfig = this._rollerConfigs["month"];
                    if (monthRollerConfig.displayItems.length !== monthRoller.option("items").length)
                        monthRoller.option({
                            items: monthRollerConfig.displayItems,
                            selectedIndex: monthRollerConfig.selectedIndex
                        })
                }
            },
            _refreshDayRoller: function() {
                var dayRoller = this._rollers["day"];
                if (dayRoller) {
                    this._createRollerConfig("day");
                    var dayRollerConfig = this._rollerConfigs["day"];
                    if (dayRollerConfig.displayItems.length !== dayRoller.option("items").length)
                        dayRoller.option({
                            items: dayRollerConfig.displayItems,
                            selectedIndex: dayRollerConfig.selectedIndex
                        })
                }
            },
            _createRollerConfigs: function(format) {
                var that = this;
                format = format || that.option("format");
                that._rollerConfigs = {};
                $.each(that._getFormatPattern(format).split(/\W+/), function(_, formatPart) {
                    $.each(dateUtils.DATE_COMPONENTS_INFO, function(componentName, componentInfo) {
                        if ($.inArray(formatPart, componentInfo.possibleFormats) > -1)
                            that._createRollerConfig(componentName)
                    })
                })
            },
            _getFormatPattern: function(format) {
                var culture = Globalize.culture(this.option("culture")),
                    result = "";
                if (format === "date")
                    result = culture.calendar.patterns.d;
                else if (format === "time")
                    result = culture.calendar.patterns.t;
                else if (format === "datetime")
                    result = [culture.calendar.patterns.d, culture.calendar.patterns.t].join(" ");
                return result
            },
            _createRollerConfig: function(componentName) {
                var componentInfo = dateUtils.DATE_COMPONENTS_INFO[componentName],
                    valueRange = this._calculateRollerConfigValueRange(componentName),
                    startValue = valueRange.startValue,
                    endValue = valueRange.endValue,
                    formatter = componentInfo.formatter,
                    showNames = this.option("showNames"),
                    curDate = this._getCurrentDate();
                var config = {
                        type: componentName,
                        setValue: componentInfo.setter,
                        valueItems: [],
                        displayItems: [],
                        getIndex: function(value) {
                            return value[componentInfo.getter]() - startValue
                        }
                    };
                for (var i = startValue; i <= endValue; i++) {
                    config.valueItems.push(i);
                    config.displayItems.push(formatter(i, showNames, curDate))
                }
                config.selectedIndex = config.getIndex(curDate);
                this._rollerConfigs[componentName] = config
            },
            _getCurrentDate: function() {
                var curDate = this.option("value"),
                    minDate = this.option("minDate"),
                    maxDate = this.option("maxDate");
                if (minDate && curDate.getTime() <= minDate.getTime())
                    curDate = minDate;
                else if (maxDate && curDate.getTime() >= maxDate.getTime())
                    curDate = maxDate;
                return curDate
            },
            _calculateRollerConfigValueRange: function(componentName) {
                var curDate = this._getCurrentDate(),
                    minDate = this.option("minDate"),
                    maxDate = this.option("maxDate"),
                    minYear = curDate.getFullYear() === minDate.getFullYear(),
                    minMonth = minYear && curDate.getMonth() === minDate.getMonth(),
                    maxYear = curDate.getFullYear() === maxDate.getFullYear(),
                    maxMonth = maxYear && curDate.getMonth() === maxDate.getMonth(),
                    componentInfo = dateUtils.DATE_COMPONENTS_INFO[componentName],
                    startValue = componentInfo.startValue,
                    endValue = componentInfo.endValue;
                if (componentName === "year") {
                    startValue = minDate.getFullYear();
                    endValue = maxDate.getFullYear()
                }
                if (componentName === "month") {
                    if (minYear)
                        startValue = minDate.getMonth();
                    if (maxYear)
                        endValue = maxDate.getMonth()
                }
                if (componentName === "day") {
                    endValue = dateUtils.getMaxMonthDay(curDate.getFullYear(), curDate.getMonth());
                    if (minYear && minMonth)
                        startValue = minDate.getDate();
                    if (maxYear && maxMonth)
                        endValue = maxDate.getDate()
                }
                return {
                        startValue: startValue,
                        endValue: endValue
                    }
            },
            _refreshRollers: function() {
                this._refreshMonthRoller();
                this._refreshDayRoller()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"showNames":
                    case"minDate":
                    case"maxDate":
                    case"culture":
                    case"format":
                        this._renderRollers();
                        this._toggleFormatClasses(args.value, args.previousValue);
                        break;
                    case"visible":
                        this.callBase(args);
                        if (args.value)
                            this._renderRollers();
                        break;
                    case"value":
                        this.option("value", this._valueOption());
                        this._refreshRollers();
                        this._updateRollersPosition();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _clean: function() {
                this.callBase();
                delete this._$rollersContainer
            },
            _dispose: function() {
                clearTimeout(this._deferredRenderDayTimeout);
                clearTimeout(this._deferredRenderMonthTimeout);
                this.callBase()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            support = DX.support,
            devices = DX.devices,
            dateUtils = ui.dateUtils,
            utils = DX.utils,
            DATEBOX_CLASS = "dx-datebox",
            DATEBOX_NATIVE_CLASS = "dx-datebox-native",
            DATEBOX_OVERLAY_CLASS = "dx-datebox-overlay",
            IE_ROUNDING_ERROR = 10;
        var realWidthSetted = function($element) {
                var explicitWidth = $element[0].style.width;
                if (explicitWidth && explicitWidth !== "auto" && explicitWidth !== "inherit")
                    return true;
                return false
            };
        var calculateWidth = function(value, $input, $element) {
                var $longestValueElement = $("<div>").text(value).css({
                        "font-style": $input.css("font-style"),
                        "font-variant": $input.css("font-variant"),
                        "font-weight": $input.css("font-weight"),
                        "font-size": $input.css("font-size"),
                        "font-family": $input.css("font-family"),
                        "letter-spacing": $input.css("letter-spacing"),
                        "padding-left": $input.css("padding-left"),
                        "padding-right": $input.css("padding-right"),
                        border: $input.css("border"),
                        visibility: "hidden",
                        "white-space": "nowrap",
                        position: "absolute",
                        float: "left"
                    });
                $longestValueElement.appendTo($element);
                var width = $longestValueElement.outerWidth() + IE_ROUNDING_ERROR;
                $longestValueElement.remove();
                return width
            };
        DX.registerComponent("dxDateBox", ui, ui.dxDropDownEditor.inherit({
            ctor: function(element, options) {
                this._userOptions = $.extend({}, options);
                this.callBase(element, options)
            },
            _supportedKeys: function() {
                return $.extend(this.callBase(), this._strategy.supportedKeys())
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    closeOnValueChange: {
                        since: "14.2",
                        message: "Use the 'applyValueMode' option instead"
                    },
                    useNative: {
                        since: "15.1",
                        message: "'useNative' option is deprecated in 15.1. Use the 'pickerType' option instead"
                    },
                    useCalendar: {
                        since: "15.1",
                        message: "'useCalendar' option is deprecated in 15.1. Use the 'pickerType' option instead"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    format: "date",
                    value: new Date,
                    min: undefined,
                    max: undefined,
                    useCalendar: false,
                    maxZoomLevel: "month",
                    useNative: true,
                    pickerType: "native"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "ios"},
                            options: {showPopupTitle: true}
                        }, {
                            device: function(device) {
                                return device.platform === "android"
                            },
                            options: {buttonsLocation: "bottom after"}
                        }, {
                            device: {platform: "win8"},
                            options: {buttonsLocation: "bottom after"}
                        }, {
                            device: function() {
                                var realDevice = DX.devices.real(),
                                    platform = realDevice.platform,
                                    version = realDevice.version;
                                return platform === "generic" || platform === "win8" || platform === "android" && (version[0] < 4 || version[0] == 4 && version[1] < 4)
                            },
                            options: {pickerType: "rollers"}
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }, {
                            device: {platform: "generic"},
                            options: {
                                pickerType: "calendar",
                                buttonsLocation: "bottom after"
                            }
                        }])
            },
            _initOptions: function(options) {
                if (DX.utils.isDefined(options.closeOnValueChange) && !DX.utils.isDefined(options.applyValueMode)) {
                    var applyValueMode = options.closeOnValueChange ? "instantly" : "useButtons";
                    $.extend(options, {applyValueMode: applyValueMode})
                }
                this.callBase(options)
            },
            _updatePickerOptions: function() {
                this.option(this._getPickerOptions())
            },
            _getPickerOptions: function() {
                var result = {};
                if (this._hasPickerTypePriority) {
                    var pickerType = this.option("pickerType");
                    this.option().useNative = pickerType === "native";
                    this.option().useCalendar = pickerType === "calendar" || pickerType === "list"
                }
                else {
                    var userOptions = this._userOptions;
                    if (userOptions) {
                        var pickerType = this.option("pickerType");
                        if (userOptions.useNative === undefined)
                            this.option("useNative", pickerType === "native");
                        if (userOptions.useCalendar === undefined)
                            this.option("useCalendar", pickerType === "list" || pickerType === "calendar")
                    }
                    var useNative = this.option("useNative"),
                        useCalendar = this.option("useCalendar");
                    if (userOptions && userOptions.useCalendar === true && userOptions.format === "time")
                        result.pickerType = "list";
                    else if (useNative)
                        result.pickerType = "native";
                    else if (useCalendar) {
                        var format = this.option("format");
                        result.pickerType = format === "date" || format === "datetime" ? "calendar" : "list"
                    }
                    else
                        result.pickerType = "rollers"
                }
                return result
            },
            _init: function() {
                this._hasPickerTypePriority = this._userOptions.pickerType !== undefined || this._userOptions.useNative === undefined && this._userOptions.useCalendar === undefined;
                this._updatePickerOptions();
                this._initStrategy();
                this.option($.extend({}, this._strategy.getDefaultOptions(), this._userOptions));
                delete this._userOptions;
                this.callBase();
                this._strategy.initFormat()
            },
            _initStrategy: function() {
                this._parseFormat(this.option("format"));
                var strategyName = this._getStrategyName(this._formatType),
                    strategy = ui.dxDateBox.renderingStrategies[strategyName];
                if (!(this._strategy && this._strategy.NAME === strategyName))
                    this._strategy = new strategy(this)
            },
            _getStrategyName: function(format) {
                switch (this.option("pickerType")) {
                    case"calendar":
                    case"list":
                        if (format === "date")
                            return "Calendar";
                        else if (format === "datetime")
                            return "CalendarWithTime";
                        else
                            return "List";
                    case"rollers":
                    case"native":
                        return this.option().useCalendar ? "Calendar" : "DateView"
                }
            },
            _parseFormat: function(format) {
                var isTime = /h|m|s/g.test(format),
                    isDate = /d|M|Y/g.test(format),
                    formatType = "";
                if (isDate)
                    formatType += "date";
                if (isTime)
                    formatType += "time";
                switch (format) {
                    case"date":
                        format = Globalize.culture().calendar.patterns["d"];
                        break;
                    case"datetime":
                        format = Globalize.culture().calendar.patterns["d"] + " " + Globalize.culture().calendar.patterns["t"];
                        break;
                    case"time":
                        format = Globalize.culture().calendar.patterns["t"];
                        break
                }
                if (format)
                    this._setFormatString(format);
                if (formatType)
                    this._setFormatType(formatType)
            },
            _setFormatString: function(formatString) {
                this._formatString = formatString
            },
            _setFormatType: function(formatType) {
                this._formatType = formatType
            },
            _attachChildKeyboardEvents: function() {
                this._strategy.attachKeyboardEvents(this._keyboardProcessor)
            },
            _render: function() {
                this.element().addClass(DATEBOX_CLASS).addClass(DATEBOX_CLASS + "-" + this.option("format"));
                this.callBase();
                this._strategy.render();
                if (this._isNativeView())
                    this.element().addClass(DATEBOX_NATIVE_CLASS);
                this._updateSize();
                this._updateDropButtonVisibility()
            },
            _popupShowingHandler: function() {
                this.callBase();
                this._strategy.popupShowingHandler()
            },
            _popupConfig: function() {
                var popupConfig = this.callBase();
                return $.extend(this._strategy.popupConfig(popupConfig), {
                        title: this._getPopupTitle(),
                        dragEnabled: false
                    })
            },
            _renderPopup: function() {
                this.callBase();
                this._popup._$wrapper.addClass(DATEBOX_OVERLAY_CLASS)
            },
            _renderPopupContent: function() {
                this.callBase();
                this._strategy.renderPopupContent()
            },
            _popupHiddenHandler: function() {
                this.callBase();
                this._strategy.popupHiddenHandler()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._updateSize()
            },
            _updateSize: function() {
                var $element = this.element(),
                    widthSetted = this.option("width") || realWidthSetted($element),
                    isElementVisible = $element.is(":visible"),
                    pickerType = this.option("pickerType"),
                    shouldCalculateWidth = pickerType !== "rollers" && devices.current().platform === "generic";
                if (widthSetted || !(shouldCalculateWidth && isElementVisible))
                    return;
                var $input = this._input(),
                    calendar = Globalize.culture().calendar,
                    format = this.option("formatString"),
                    longestValue = Globalize.format(dateUtils.getLongestDate(format, calendar.months.names, calendar.days.names), format);
                $element.width(calculateWidth(longestValue, $input, this.element()))
            },
            _usingNativeDatePicker: function() {
                return support.inputType(this.option("mode")) && this.option("pickerType") === "native"
            },
            _readOnlyPropValue: function() {
                if (this._usingNativeDatePicker())
                    return this.callBase();
                return this.option("readOnly") || this.option("pickerType") === "rollers"
            },
            _checkIfClearButtonShouldBeRendered: function() {
                return !this._isNativeView() && this.callBase()
            },
            _renderValue: function() {
                var mode = this.option("mode"),
                    value = this.option("value"),
                    patternKey = dateUtils.FORMATS_MAP[mode],
                    pattern = this._getPattern(patternKey);
                this._validateValue(value);
                if (mode !== "text")
                    this.option("text", dateUtils.toStandardDateFormat(value, mode, pattern));
                else
                    this.option("text", Globalize.format(value, this.option("formatString")));
                this._strategy.renderValue();
                this.callBase();
                this._textHasBeenChanged = false
            },
            _getPattern: function(patternKey) {
                return !support.inputType(this.option("mode")) ? Globalize.culture().calendar.patterns[patternKey] : null
            },
            _valueChangeEventHandler: function(e) {
                var text = this.option("text"),
                    date = this._strategy.getParsedText(text, this.option("formatString")),
                    value = this.option("value"),
                    modelValue = new Date(value && value.valueOf()),
                    mode = this.option("mode"),
                    newValue = (mode !== "text" ? dateUtils.mergeDates(modelValue, date, mode) : date) || null;
                this._text = text;
                this._textHasBeenChanged = true;
                if (this._validateValue(date))
                    this.option("value", newValue);
                else
                    this.option().value = null;
                this.validationRequest.fire({
                    value: newValue,
                    editor: this
                })
            },
            _validateValue: function(value) {
                var text = this.option("text"),
                    hasText = !!text,
                    isDate = !!value,
                    isDateInRange = isDate && utils.dateInRange(value, this.option("min"), this.option("max")),
                    isValid = this._textHasBeenChanged && !hasText || !hasText && !value || isDateInRange,
                    validationMessage = "";
                if (!isDate)
                    validationMessage = Globalize.localize("dxDateBox-validation-datetime");
                else if (!isDateInRange)
                    validationMessage = Globalize.localize("validation-range");
                this.option({
                    isValid: isValid,
                    validationError: isValid ? null : {
                        editorSpecific: true,
                        message: validationMessage
                    }
                });
                return isValid
            },
            _updateDropButtonVisibility: function() {
                this.option("showDropButton", DX.devices.real().platform !== "generic" || this.option("pickerType") !== "native")
            },
            _renderProps: function() {
                this.callBase();
                this._input().attr("autocomplete", "off")
            },
            _renderOpenedState: function() {
                if (!this._isNativeView())
                    this.callBase();
                this._strategy.renderOpenedState()
            },
            _isNativeView: function() {
                return this.option("pickerType") === "native"
            },
            _popupShownHandler: function(e) {
                this.callBase.apply(this, arguments);
                this._text = this.option("text")
            },
            _getPopupTitle: function() {
                var result = this.option("placeholder");
                if (!result) {
                    var format = this.option("format");
                    switch (format) {
                        case"time":
                            result = Globalize.localize("dxDateBox-simulatedDataPickerTitleTime");
                            break;
                        case"date":
                            result = Globalize.localize("dxDateBox-simulatedDataPickerTitleDate");
                            break;
                        case"datetime":
                            result = Globalize.localize("dxDateBox-simulatedDataPickerTitleDateTime");
                            break
                    }
                }
                return result
            },
            _renderPlaceholder: function() {
                var popupTitle = this._getPopupTitle();
                this._popup && this._popup.option("title", popupTitle);
                this.callBase()
            },
            _refreshStrategy: function() {
                this._strategy.dispose();
                this._initStrategy();
                this._strategy.initFormat();
                this.option(this._strategy.getDefaultOptions());
                this._refresh()
            },
            _applyButtonHandler: function() {
                this.option("value", this._strategy.getValue());
                this.callBase()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"useCalendar":
                    case"useNative":
                        this._hasPickerTypePriority = false;
                        this._updatePickerOptions();
                        break;
                    case"pickerType":
                        this._hasPickerTypePriority = true;
                        this._updatePickerOptions();
                        this._refreshStrategy();
                        this._invalidate();
                        break;
                    case"format":
                        this._updatePickerOptions();
                        this._refreshStrategy();
                        break;
                    case"placeholder":
                        this._renderPlaceholder();
                        break;
                    case"readOnly":
                    case"min":
                    case"max":
                    case"interval":
                    case"maxZoomLevel":
                        this._invalidate();
                        break;
                    case"type":
                        throw DX.Error("E1020");
                        break;
                    case"formatString":
                    case"formatWidthCalculator":
                        break;
                    case"closeOnValueChange":
                        var applyValueMode = args.value ? "instantly" : "useButtons";
                        this.option("applyValueMode", applyValueMode);
                        break;
                    case"applyValueMode":
                        this._suppressDeprecatedWarnings();
                        this.option("closeOnValueChange", args.value === "instantly");
                        this._resumeDeprecatedWarnings();
                        this.callBase.apply(this, arguments);
                        break;
                    case"text":
                        this._strategy.textChangedHandler(args.value);
                        this.callBase.apply(this, arguments);
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            }
        }));
        ui.dxDateBox.renderingStrategies = {}
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.strategy.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        ui.dxDateBox.strategy = DX.Class.inherit({
            ctor: function(dateBox) {
                this.dateBox = dateBox
            },
            widgetOption: function() {
                return this._widget && this._widget.option.apply(this._widget, arguments)
            },
            _renderWidget: function(element) {
                element = element || $("<div>");
                this._widget = this._createWidget(element);
                this._widget.element().appendTo(this._getWidgetContainer())
            },
            _createWidget: function(element) {
                return this.dateBox._createComponent(element, this._getWidgetName(), this._getWidgetOptions())
            },
            _getWidgetOptions: DX.abstract,
            _getWidgetName: DX.abstract,
            initFormat: function() {
                this.dateBox.option("mode", "text")
            },
            supportedKeys: $.noop,
            attachKeyboardEvents: function(keyboardProcessor) {
                this._widgetKeyboardProcessor = keyboardProcessor.attachChildProcessor()
            },
            getParsedText: function(text, format) {
                return Globalize.parseDate(text, format)
            },
            getDefaultOptions: DX.abstract,
            _getDateBoxClass: DX.abstract,
            renderOpenedState: function() {
                if (this.dateBox.option("opened"))
                    this._updateValue()
            },
            popupConfig: DX.abstract,
            renderPopupContent: function() {
                var popup = this._getPopup();
                popup._wrapper().addClass(this._getPopupWrapperClass());
                this._renderWidget();
                popup.content().parent().off("mousedown").on("mousedown", $.proxy(this._preventFocusOnPopup, this))
            },
            _preventFocusOnPopup: function(e) {
                e.preventDefault()
            },
            _getWidgetContainer: function() {
                return this._getPopup().content()
            },
            _getPopup: function() {
                return this.dateBox._popup
            },
            _getPopupWrapperClass: DX.abstract,
            popupShowingHandler: $.noop,
            popupHiddenHandler: $.noop,
            _getDateBoxValue: function() {
                return this.dateBox.option("value")
            },
            _updateValue: function() {
                this._widget && this._widget.option("value", this._getDateBoxValue())
            },
            _valueChangedHandler: function(args) {
                if (this.dateBox.option("opened") && this.dateBox.option("applyValueMode") === "instantly")
                    this.dateBox.option("value", args.value)
            },
            textChangedHandler: $.noop,
            renderValue: function() {
                if (this.dateBox.option("opened"))
                    this._updateValue()
            },
            getValue: function() {
                return this._widget.option("value")
            },
            render: function() {
                this.dateBox.element().addClass(this._getDateBoxClass())
            },
            dispose: function() {
                this.dateBox.element().removeClass(this._getDateBoxClass());
                var popup = this._getPopup();
                if (popup) {
                    popup._wrapper().removeClass(this._getPopupWrapperClass());
                    popup.content().empty()
                }
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.strategy.calendar.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            DATEBOX_WITH_CALENDAR_CLASS = "dx-datebox-with-calendar",
            DATEBOX_CALENDAR_OVERLAY_CLASS = "dx-datebox-calendar-overlay",
            DATEBOX_CELL_CLASS = "dx-datebox-container-cell",
            DATEBOX_BUTTON_CLASS = "dx-datebox-button-cell",
            DATEBOX_BUTTONS_CONTAINER_CLASS = "dx-datebox-buttons-container",
            DATEBOX_APPLY_BUTTON_CLASS = "dx-datebox-apply-button",
            DATEBOX_CANCEL_BUTTON_CLASS = "dx-datebox-cancel-button";
        ui.dxDateBox.renderingStrategies["Calendar"] = ui.dxDateBox.strategy.inherit({
            NAME: "Calendar",
            supportedKeys: function() {
                return {
                        tab: function() {
                            this.close()
                        },
                        rightArrow: function() {
                            if (this.option("opened"))
                                return true
                        },
                        leftArrow: function() {
                            if (this.option("opened"))
                                return true
                        },
                        enter: $.proxy(function(e) {
                            if (this.dateBox.option("opened")) {
                                if (this.dateBox._text !== e.target.value) {
                                    this.dateBox._valueChangeEventHandler(e);
                                    return false
                                }
                                if (this._widget.option("zoomLevel") === this._widget.option("maxZoomLevel")) {
                                    var contouredDate = this._widget._view.option("contouredDate");
                                    contouredDate && this.dateBox.option("value", contouredDate);
                                    this.dateBox.close();
                                    this.dateBox._valueChangeEventHandler(e)
                                }
                                else
                                    return true
                            }
                        }, this)
                    }
            },
            getDefaultOptions: function() {
                return {formatString: Globalize.culture().calendar.patterns["d"]}
            },
            _getDateBoxClass: function() {
                return DATEBOX_WITH_CALENDAR_CLASS
            },
            _getPopupWrapperClass: function() {
                return DATEBOX_CALENDAR_OVERLAY_CLASS
            },
            _getWidgetName: function() {
                return "dxCalendar"
            },
            _getWidgetOptions: function() {
                return $.extend(this.dateBox.option("calendarOptions"), {
                        value: this._getDateBoxValue(),
                        _keyboardProcessor: this._widgetKeyboardProcessor,
                        min: this.dateBox.option("min"),
                        max: this.dateBox.option("max"),
                        onValueChanged: $.proxy(this._valueChangedHandler, this),
                        onCellClick: $.proxy(this._cellClickHandler, this),
                        tabIndex: null,
                        maxZoomLevel: this.dateBox.option("maxZoomLevel"),
                        onContouredChanged: $.proxy(this._refreshActiveDescendant, this)
                    })
            },
            _refreshActiveDescendant: function(e) {
                this.dateBox.setAria("activedescendant", e.actionValue)
            },
            popupConfig: function(popupConfig) {
                var buttons = popupConfig.buttons,
                    buttonsLocation = this.dateBox.option("buttonsLocation");
                var position = [];
                if (buttonsLocation !== "default")
                    position = DX.utils.splitPair(buttonsLocation);
                else
                    position = ["bottom", "center"];
                if (this.dateBox.option("applyValueMode") === "useButtons")
                    buttons.unshift({
                        widget: "button",
                        toolbar: position[0],
                        location: position[1] === "after" ? "before" : position[1],
                        options: {
                            onClick: $.proxy(function() {
                                this._widget._toTodayView()
                            }, this),
                            text: "Today",
                            type: "today"
                        }
                    });
                return $.extend(popupConfig, {buttons: buttons})
            },
            _valueChangedHandler: function(e) {
                var dateBox = this.dateBox;
                if (dateBox.option("applyValueMode") === "instantly")
                    dateBox.option("value", this.getValue())
            },
            _updateValue: function() {
                var parsedValue = this.getParsedText(this.dateBox.option("text"), this.dateBox.option("formatString"));
                if (this._widget)
                    this._widget.option("value", parsedValue)
            },
            textChangedHandler: function(text) {
                if (this.dateBox.option("opened")) {
                    var value = this.getParsedText(text, this.dateBox.option("formatString"));
                    if (value)
                        this._widget && this._widget.option("value", value)
                }
            },
            _cellClickHandler: function() {
                var dateBox = this.dateBox;
                if (dateBox.option("applyValueMode") === "instantly")
                    dateBox.option("opened", dateBox._textHasBeenChanged)
            },
            dispose: function() {
                this.dateBox.off("optionChanged");
                this.callBase()
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.strategy.calendarWithTime.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            CALENDAR_WITH_TIME_PICKER_CLASS = "dx-calendar-with-time-picker",
            CALENDAR_WITH_TIME_PICKER_CONTAINER_CLASS = "dx-calendar-with-time-picker-container";
        ui.dxDateBox.renderingStrategies["CalendarWithTime"] = ui.dxDateBox.renderingStrategies["Calendar"].inherit({
            NAME: "CalendarWithTime",
            supportedKeys: function() {
                return $.extend(this.callBase(), {tab: function(e) {
                            if (this.option("opened") === true) {
                                e.preventDefault();
                                this._strategy._timeView._hourBox.focus()
                            }
                        }})
            },
            getDefaultOptions: function() {
                return $.extend(this.callBase(), {
                        formatString: Globalize.culture().calendar.patterns["d"] + " " + Globalize.culture().calendar.patterns["t"],
                        applyValueMode: "useButtons",
                        buttonsLocation: "bottom after",
                        showPopupTitle: false
                    })
            },
            _renderWidget: function() {
                this.callBase();
                this._timeView = this.dateBox._createComponent($("<div>"), "dxTimeView", {
                    value: this.dateBox.option("value"),
                    onValueChanged: $.proxy(this._valueChangedHandler, this)
                })
            },
            _updateValue: function() {
                var date = this._getDateBoxValue() || new Date(1970, 0, 1, 0, 0, 0);
                this.callBase();
                this._timeView && this._timeView.option("value", date)
            },
            renderPopupContent: function() {
                this.callBase();
                var $popupContent = this._getPopup().content().addClass(CALENDAR_WITH_TIME_PICKER_CONTAINER_CLASS);
                this.dateBox._createComponent($("<div>").appendTo($popupContent), "dxBox", {
                    direction: "row",
                    crossAlign: "start",
                    items: [{
                            ratio: 0,
                            baseSize: "auto",
                            name: "calendar"
                        }, {
                            ratio: 0,
                            baseSize: "auto",
                            name: "time"
                        }],
                    itemTemplate: $.proxy(function(data) {
                        switch (data.name) {
                            case"calendar":
                                return $("<div>").append(this._widget.element());
                                break;
                            case"time":
                                return $("<div>").append(this._timeView.element());
                                break
                        }
                    }, this)
                });
                this._attachTabHandler()
            },
            _attachTabHandler: function() {
                var dateBox = this.dateBox,
                    handler = function(e) {
                        if (e.shiftKey) {
                            e.preventDefault();
                            dateBox.focus()
                        }
                    };
                this._timeView._hourBox.registerKeyHandler("tab", handler)
            },
            _preventFocusOnPopup: function(e) {
                if (!$(e.target).hasClass("dx-texteditor-input")) {
                    this.callBase.apply(this, arguments);
                    if (!this.dateBox.element().hasClass("dx-state-focused"))
                        this.dateBox.focus()
                }
            },
            getValue: function() {
                var date = new Date(this._widget.option("value")),
                    value = this._timeView.option("value");
                date.setHours(value.getHours(), value.getMinutes(), value.getSeconds());
                return date
            },
            render: function() {
                this.dateBox.element().addClass(CALENDAR_WITH_TIME_PICKER_CLASS);
                this.callBase()
            },
            dispose: function() {
                this.dateBox.element().removeClass(CALENDAR_WITH_TIME_PICKER_CLASS);
                this.callBase();
                var popup = this._getPopup();
                popup && popup._wrapper().removeClass(this._getPopupWrapperClass())
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.strategy.dateView.js */
    var DATEVIEW_PICKER_OVERLAY_CLASS = "dx-dateview-picker-overlay";
    (function($, DX, undefined) {
        var ui = DX.ui,
            support = DX.support,
            dateUtils = ui.dateUtils,
            DATEBOX_DATEVIEW_CLASS = "dx-datebox-dateview";
        ui.dxDateBox.renderingStrategies["DateView"] = ui.dxDateBox.strategy.inherit({
            NAME: "DateView",
            popupShowingHandler: function() {
                this._widget.option("visible", true)
            },
            popupHiddenHandler: function() {
                this._widget.option("visible", false)
            },
            getDefaultOptions: function() {
                return {
                        openOnFieldClick: true,
                        applyButtonText: Globalize.localize("Done")
                    }
            },
            _getDateBoxClass: function() {
                return DATEBOX_DATEVIEW_CLASS
            },
            popupConfig: function() {
                return {
                        showTitle: true,
                        buttons: this.dateBox._popupButtonsConfig(),
                        defaultOptionsRules: [{
                                device: {platform: "win8"},
                                options: {showNames: true}
                            }, {
                                device: {
                                    platform: "win8",
                                    phone: true
                                },
                                options: {
                                    fullScreen: true,
                                    animation: null
                                }
                            }, {
                                device: function(device) {
                                    return device.platform !== "win8"
                                },
                                options: {
                                    width: 333,
                                    height: 331
                                }
                            }, {
                                device: {platform: "generic"},
                                options: {
                                    width: "auto",
                                    height: "auto"
                                }
                            }, {
                                device: {platform: "ios"},
                                options: {
                                    width: "auto",
                                    height: "auto"
                                }
                            }, {
                                device: {
                                    platform: "ios",
                                    phone: true
                                },
                                options: {
                                    width: "100%",
                                    position: {
                                        my: "bottom",
                                        at: "bottom",
                                        of: window
                                    }
                                }
                            }]
                    }
            },
            getParsedText: function(text) {
                return dateUtils.fromStandardDateFormat(text)
            },
            _renderWidget: function() {
                if (this.dateBox._usingNativeDatePicker() || this.dateBox.option("readOnly")) {
                    if (this._widget) {
                        this._widget.element().remove();
                        this._widget = null
                    }
                    return
                }
                var popup = this._getPopup();
                if (this._widget)
                    this._widget.option(this._getWidgetOptions());
                else {
                    var element = $("<div>").appendTo(popup.content());
                    this._widget = this._createWidget(element)
                }
                this._widget.element().appendTo(this._getWidgetContainer());
                popup._$wrapper.addClass(DATEVIEW_PICKER_OVERLAY_CLASS)
            },
            _getWidgetName: function() {
                return "dxDateView"
            },
            _getDateBoxValue: function() {
                return this.callBase() || new Date
            },
            _getWidgetOptions: function() {
                return {
                        value: this._getDateBoxValue(),
                        format: this.dateBox.option("format"),
                        minDate: this.dateBox.option("min") || new Date(1),
                        maxDate: this.dateBox.option("max") || new Date($.now() + dateUtils.TEN_YEARS),
                        visible: false,
                        onDisposing: $.proxy(function() {
                            this._widget = null
                        }, this)
                    }
            },
            _getPopupWrapperClass: function() {
                return ""
            },
            initFormat: function() {
                var format = this.dateBox.option("format");
                if ($.inArray(format, dateUtils.SUPPORTED_FORMATS) === -1)
                    format = "date";
                else if (format === "datetime" && !support.inputType(format))
                    format = "datetime-local";
                this.dateBox.option({
                    mode: format,
                    formatString: dateUtils.FORMATS_MAP[format]
                })
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.dateBox.strategy.list.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            dateUtils = ui.dateUtils,
            DATEBOX_LIST_CLASS = "dx-datebox-list",
            DATEBOX_LIST_POPUP_WRAPPER = "dx-datebox-list-popup-wrapper";
        ui.dxDateBox.renderingStrategies["List"] = ui.dxDateBox.strategy.inherit({
            NAME: "List",
            supportedKeys: function() {
                return {
                        tab: function(e) {
                            if (this.option("opened"))
                                this.close()
                        },
                        space: $.noop,
                        home: $.noop,
                        end: $.noop
                    }
            },
            getDefaultOptions: function() {
                return {
                        formatString: Globalize.culture().calendar.patterns["t"],
                        applyValueMode: "instantly",
                        interval: 30
                    }
            },
            _getDateBoxClass: function() {
                return DATEBOX_LIST_CLASS
            },
            _getPopupWrapperClass: function() {
                return DATEBOX_LIST_POPUP_WRAPPER
            },
            popupConfig: function(popupConfig) {
                return $.extend(popupConfig, {width: this.dateBox.element().outerWidth()})
            },
            popupShowingHandler: function() {
                this._dimensionChanged()
            },
            _renderWidget: function() {
                this.callBase();
                this._refreshItems()
            },
            _getWidgetName: function() {
                return "dxList"
            },
            _getWidgetOptions: function() {
                var keyboardProcessor = this.dateBox._keyboardProcessor;
                return {
                        _keyboardProcessor: keyboardProcessor ? keyboardProcessor.attachChildProcessor() : null,
                        itemTemplate: $.proxy(this._timeListItemTemplate, this),
                        onItemClick: $.proxy(this._listItemClickHandler, this),
                        focusStateEnabled: this.dateBox.option("focusStateEnabled"),
                        tabIndex: -1,
                        onFocusedItemChanged: $.proxy(this._refreshActiveDescendant, this)
                    }
            },
            _refreshActiveDescendant: function(e) {
                this.dateBox.setAria("activedescendant", "");
                this.dateBox.setAria("activedescendant", e.actionValue)
            },
            _refreshItems: function() {
                var items = this._getTimeListItems();
                this._widget.option("items", items)
            },
            _getTimeListItems: function() {
                var min = this.dateBox.option("min") || new Date(0, 0, 0, 0, 0),
                    max = this.dateBox.option("max") || new Date(0, 0, 0, 23, 59),
                    interval = this.dateBox.option("interval"),
                    result = [],
                    current = new Date(min),
                    delta = max - min;
                if (delta < 0)
                    return [];
                if (delta > dateUtils.ONE_DAY)
                    delta = dateUtils.ONE_DAY;
                while (current - min < delta) {
                    result.push(new Date(current));
                    current.setMinutes(current.getMinutes() + interval)
                }
                return result
            },
            _timeListItemTemplate: function(itemData) {
                return Globalize.format(itemData, this.dateBox.option("formatString"))
            },
            _listItemClickHandler: function(e) {
                this.dateBox.option("opened", false);
                this.dateBox.option("value", e.itemData)
            },
            attachKeyboardEvents: function(keyboardProcessor) {
                var child = keyboardProcessor.attachChildProcessor();
                if (this._widget)
                    this._widget.option("_keyboardProcessor", child)
            },
            _dimensionChanged: function() {
                this._getPopup() && this._updatePopupDimensions()
            },
            _updatePopupDimensions: function() {
                this._updatePopupWidth();
                this._updatePopupHeight()
            },
            _updatePopupWidth: function() {
                this.dateBox._setPopupOption("width", this.dateBox.element().outerWidth())
            },
            _updatePopupHeight: function() {
                this.dateBox._setPopupOption("height", "auto");
                var popupHeight = this.dateBox._popup.overlayContent().outerHeight();
                var maxHeight = $(window).height() * 0.45;
                this.dateBox._setPopupOption("height", Math.min(popupHeight, maxHeight));
                this.dateBox._timeList && this.dateBox._timeList.updateDimensions()
            }
        })
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.loadIndicator.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LOADINDICATOR_CLASS = "dx-loadindicator",
            LOADINDICATOR_WRAPPER_CLASS = "dx-loadindicator-wrapper",
            LOADINDICATOR_CONTENT_CLASS = "dx-loadindicator-content",
            LOADINDICATOR_ICON_CLASS = "dx-loadindicator-icon",
            LOADINDICATOR_SEGMENT_CLASS = "dx-loadindicator-segment",
            LOADINDICATOR_SEGMENT_INNER_CLASS = "dx-loadindicator-segment-inner",
            LOADINDICATOR_IMAGE_CLASS = "dx-loadindicator-image";
        DX.registerComponent("dxLoadIndicator", ui, ui.Widget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    indicatorSrc: "",
                    activeStateEnabled: false,
                    hoverStateEnabled: false,
                    _animatingSegmentCount: 0
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function() {
                                var realDevice = DevExpress.devices.real(),
                                    obsoleteAndroid = realDevice.platform === "android" && !/chrome/i.test(navigator.userAgent);
                                return DevExpress.browser.msie && DevExpress.browser.version < 10 || obsoleteAndroid
                            },
                            options: {viaImage: true}
                        }, {
                            device: [{platform: "win8"}],
                            options: {_animatingSegmentCount: 5}
                        }, {
                            device: function(device) {
                                return device.platform === "ios"
                            },
                            options: {_animatingSegmentCount: 11}
                        }, {
                            device: [{platform: "android"}],
                            options: {_animatingSegmentCount: 2}
                        }, {
                            device: [{platform: "generic"}],
                            options: {_animatingSegmentCount: 7}
                        }])
            },
            _init: function() {
                this.callBase();
                this.element().addClass(LOADINDICATOR_CLASS)
            },
            _render: function() {
                this._renderWrapper();
                this._renderContent();
                this._renderMarkup();
                this.callBase()
            },
            _renderWrapper: function() {
                this._$wrapper = $("<div>").addClass(LOADINDICATOR_WRAPPER_CLASS);
                this.element().append(this._$wrapper)
            },
            _renderContent: function() {
                this._$content = $("<div>").addClass(LOADINDICATOR_CONTENT_CLASS);
                this._$wrapper.append(this._$content)
            },
            _renderMarkup: function() {
                if (DX.support.animation && !this.option("viaImage") && !this.option("indicatorSrc"))
                    this._renderMarkupForAnimation();
                else
                    this._renderMarkupForImage()
            },
            _renderMarkupForAnimation: function() {
                var currentDevice = DX.devices.current();
                this._$indicator = $("<div>").addClass(LOADINDICATOR_ICON_CLASS);
                this._$content.append(this._$indicator);
                for (var i = this.option("_animatingSegmentCount"); i >= 0; --i) {
                    var $segment = $("<div>").addClass(LOADINDICATOR_SEGMENT_CLASS).addClass(LOADINDICATOR_SEGMENT_CLASS + i);
                    if (currentDevice.platform == "android")
                        $segment.append($("<div>").addClass(LOADINDICATOR_SEGMENT_INNER_CLASS));
                    this._$indicator.append($segment)
                }
            },
            _renderMarkupForImage: function() {
                var indicatorSrc = this.option("indicatorSrc");
                this._$wrapper.addClass(LOADINDICATOR_IMAGE_CLASS);
                if (indicatorSrc)
                    this._$wrapper.css("background-image", "url(" + indicatorSrc + ")")
            },
            _renderDimensions: function() {
                this.callBase();
                this._updateContentSizeForAnimation()
            },
            _updateContentSizeForAnimation: function() {
                if (!this._$indicator)
                    return;
                var $element = this.element(),
                    width = this.option("width"),
                    height = this.option("height");
                if (width || height) {
                    width = this.element().width();
                    height = this.element().height();
                    var minDimention = Math.min(height, width);
                    this._$wrapper.css({
                        height: minDimention,
                        width: minDimention,
                        "font-size": minDimention
                    })
                }
            },
            _clean: function() {
                this.callBase();
                this._removeMarkupForAnimation();
                this._removeMarkupForImage()
            },
            _removeMarkupForAnimation: function() {
                if (!this._$indicator)
                    return;
                this._$indicator.remove();
                delete this._$indicator
            },
            _removeMarkupForImage: function() {
                this._$wrapper.css("background-image", "none")
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"_animatingSegmentCount":
                    case"indicatorSrc":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.loadPanel.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var LOADPANEL_CLASS = "dx-loadpanel",
            LOADPANEL_WRAPPER_CLASS = "dx-loadpanel-wrapper",
            LOADPANEL_INDICATOR_CLASS = "dx-loadpanel-indicator",
            LOADPANEL_MESSAGE_CLASS = "dx-loadpanel-message",
            LOADPANEL_CONTENT_CLASS = "dx-loadpanel-content",
            LOADPANEL_CONTENT_WRAPPER_CLASS = "dx-loadpanel-content-wrapper",
            LOADPANEL_PANE_HIDDEN_CLASS = "dx-loadpanel-pane-hidden";
        DX.registerComponent("dxLoadPanel", ui, ui.dxOverlay.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    message: Globalize.localize("Loading"),
                    width: 222,
                    height: 90,
                    animation: null,
                    showIndicator: true,
                    indicatorSrc: "",
                    showPane: true,
                    delay: 0,
                    closeOnBackButton: false,
                    resizeEnabled: false
                })
            },
            _init: function() {
                this.callBase.apply(this, arguments);
                this._$contentWrapper = $("<div>").addClass(LOADPANEL_CONTENT_WRAPPER_CLASS);
                this._$contentWrapper.appendTo(this._$content)
            },
            _render: function() {
                this.callBase();
                this.element().addClass(LOADPANEL_CLASS);
                this._wrapper().addClass(LOADPANEL_WRAPPER_CLASS)
            },
            _renderContentImpl: function() {
                this.callBase();
                this.content().addClass(LOADPANEL_CONTENT_CLASS);
                this._togglePaneVisible();
                this._cleanPreviousContent();
                this._renderLoadIndicator();
                this._renderMessage()
            },
            _show: function() {
                var delay = this.option("delay");
                if (!delay)
                    return this.callBase();
                var deferred = $.Deferred();
                var callBase = $.proxy(this.callBase, this);
                this._clearShowTimeout();
                this._showTimeout = setTimeout(function() {
                    callBase().done(function() {
                        deferred.resolve()
                    })
                }, delay);
                return deferred.promise()
            },
            _hide: function() {
                this._clearShowTimeout();
                return this.callBase()
            },
            _clearShowTimeout: function() {
                clearTimeout(this._showTimeout)
            },
            _renderMessage: function() {
                var message = this.option("message");
                if (!message)
                    return;
                var $message = $("<div>").addClass(LOADPANEL_MESSAGE_CLASS).text(message);
                this._$contentWrapper.append($message)
            },
            _renderLoadIndicator: function() {
                if (!this.option("showIndicator"))
                    return;
                this._$indicator = $("<div>").addClass(LOADPANEL_INDICATOR_CLASS).appendTo(this._$contentWrapper);
                this._createComponent(this._$indicator, "dxLoadIndicator", {indicatorSrc: this.option("indicatorSrc")})
            },
            _cleanPreviousContent: function() {
                this.content().find("." + LOADPANEL_MESSAGE_CLASS).remove();
                this.content().find("." + LOADPANEL_INDICATOR_CLASS).remove()
            },
            _togglePaneVisible: function() {
                this.content().toggleClass(LOADPANEL_PANE_HIDDEN_CLASS, !this.option("showPane"))
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"delay":
                        break;
                    case"message":
                    case"showIndicator":
                        this._cleanPreviousContent();
                        this._renderLoadIndicator();
                        this._renderMessage();
                        break;
                    case"showPane":
                        this._togglePaneVisible();
                        break;
                    case"indicatorSrc":
                        if (this._$indicator)
                            this._createComponent(this._$indicator, "dxLoadIndicator", {indicatorSrc: this.option("indicatorSrc")});
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _dispose: function() {
                this._clearShowTimeout();
                this.callBase()
            }
        }));
        ui.dxLoadPanel.__internals = {
            LOADPANEL_CLASS: LOADPANEL_CLASS,
            LOADPANEL_WRAPPER_CLASS: LOADPANEL_WRAPPER_CLASS,
            LOADPANEL_MESSAGE_CLASS: LOADPANEL_MESSAGE_CLASS,
            LOADPANEL_CONTENT_CLASS: LOADPANEL_CONTENT_CLASS,
            LOADPANEL_PANE_HIDDEN_CLASS: LOADPANEL_PANE_HIDDEN_CLASS
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.lookup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            events = ui.events;
        var LOOKUP_CLASS = "dx-lookup",
            LOOKUP_SELECTED_CLASS = "dx-lookup-selected",
            LOOKUP_SEARCH_CLASS = "dx-lookup-search",
            LOOKUP_SEARCH_WRAPPER_CLASS = "dx-lookup-search-wrapper",
            LOOKUP_FIELD_CLASS = "dx-lookup-field",
            LOOKUP_FIELD_WRAPPER_CLASS = "dx-lookup-field-wrapper",
            LOOKUP_POPUP_CLASS = "dx-lookup-popup",
            LOOKUP_POPUP_WRAPPER_CLASS = "dx-lookup-popup-wrapper",
            LOOKUP_POPUP_SEARCH_CLASS = "dx-lookup-popup-search",
            LOOKUP_POPOVER_MODE = "dx-lookup-popover-mode",
            LOOKUP_EMPTY_CLASS = "dx-lookup-empty",
            LOOKUP_POPUP_VALIDATION_MESSAGE = "dx-lookup-validation-message",
            LIST_ITEM_SELECTOR = ".dx-list-item",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            POPUP_HIDE_TIMEOUT = 200;
        var POPUP_OPTION_MAP = {
                popupWidth: "width",
                popupHeight: "height"
            };
        DX.registerComponent("dxLookup", ui, ui.dxDropDownList.inherit({
            _supportedKeys: function() {
                return $.extend(this.callBase(), {
                        space: function(e) {
                            this._validatedOpening()
                        },
                        enter: function(e) {
                            this._validatedOpening()
                        }
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {
                    minFilterLength: {
                        since: "14.2",
                        alias: "minSearchLength"
                    },
                    scrollAction: {
                        since: "14.2",
                        alias: "onScroll"
                    },
                    autoPagingEnabled: {
                        since: "14.2",
                        alias: "pagingEnabled"
                    },
                    pullRefreshAction: {
                        since: "14.2",
                        alias: "onPullRefresh"
                    },
                    pageLoadingAction: {
                        since: "14.2",
                        alias: "onPageLoading"
                    },
                    contentReadyAction: {
                        since: "14.2",
                        alias: "onContentReady"
                    },
                    titleRender: {
                        since: "14.2",
                        alias: "titleTemplate"
                    },
                    groupRender: {
                        since: "14.2",
                        alias: "groupTemplate"
                    },
                    doneButtonText: {
                        since: "14.2",
                        alias: "applyButtonText"
                    },
                    showDoneButton: {
                        since: "14.2",
                        message: "use the 'applyValueMode' option instead"
                    },
                    showNextButton: {
                        since: "15.1",
                        message: "Use the 'pageLoadMode' option instead"
                    },
                    pagingEnabled: {
                        since: "15.1",
                        message: "Use the 'dataSource.paginate' option instead"
                    }
                })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    title: "",
                    titleTemplate: "title",
                    onTitleRendered: null,
                    placeholder: Globalize.localize("Select"),
                    searchPlaceholder: Globalize.localize("Search"),
                    searchEnabled: true,
                    cleanSearchOnOpening: true,
                    fullScreen: false,
                    showCancelButton: true,
                    cancelButtonText: Globalize.localize("Cancel"),
                    showClearButton: false,
                    clearButtonText: Globalize.localize("Clear"),
                    applyButtonText: Globalize.localize("Done"),
                    popupWidth: function() {
                        return $(window).width() * 0.8
                    },
                    popupHeight: function() {
                        return $(window).height() * 0.8
                    },
                    shading: true,
                    closeOnOutsideClick: false,
                    position: undefined,
                    animation: undefined,
                    pullRefreshEnabled: false,
                    useNativeScrolling: true,
                    pullingDownText: Globalize.localize("dxList-pullingDownText"),
                    pulledDownText: Globalize.localize("dxList-pulledDownText"),
                    refreshingText: Globalize.localize("dxList-refreshingText"),
                    pageLoadingText: Globalize.localize("dxList-pageLoadingText"),
                    onScroll: null,
                    onPullRefresh: null,
                    onPageLoading: null,
                    pageLoadMode: "scrollBottom",
                    showNextButton: undefined,
                    nextButtonText: Globalize.localize("dxList-nextButtonText"),
                    grouped: false,
                    groupTemplate: "group",
                    usePopover: false,
                    showDropButton: false,
                    focusStateEnabled: false,
                    showPopupTitle: true
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return !DX.support.nativeScrolling
                            },
                            options: {useNativeScrolling: false}
                        }, {
                            device: function(device) {
                                return !DX.support.nativeScrolling && !DX.devices.isSimulator() && DX.devices.real().platform === "generic" && device.platform === "generic"
                            },
                            options: {
                                pageLoadMode: "nextButton",
                                usePopover: true
                            }
                        }, {
                            device: {
                                platform: "win8",
                                phone: true
                            },
                            options: {
                                showCancelButton: false,
                                fullScreen: true
                            }
                        }, {
                            device: {
                                platform: "win8",
                                phone: false
                            },
                            options: {popupWidth: function() {
                                    return $(window).width()
                                }}
                        }, {
                            device: {
                                platform: "ios",
                                phone: true
                            },
                            options: {fullScreen: true}
                        }, {
                            device: {
                                platform: "ios",
                                tablet: true
                            },
                            options: {
                                popupWidth: function() {
                                    return Math.min($(window).width(), $(window).height()) * 0.4
                                },
                                popupHeight: function() {
                                    return Math.min($(window).width(), $(window).height()) * 0.4
                                },
                                usePopover: true
                            }
                        }, {
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }, {
                            device: {platform: "generic"},
                            options: {buttonsLocation: "bottom center"}
                        }])
            },
            _initOptions: function(options) {
                if (DX.utils.isDefined(options.showDoneButton) && !DX.utils.isDefined(options.applyValueMode)) {
                    var applyValueMode = options.showDoneButton ? "useButtons" : "instantly";
                    $.extend(options, {applyValueMode: applyValueMode})
                }
                this.callBase(options)
            },
            _getAriaTarget: function() {
                return this._$field
            },
            _dataSourceOptions: function() {
                this._suppressDeprecatedWarnings();
                var pagingEnabled = this.option("pagingEnabled");
                pagingEnabled = utils.isDefined(this.option("showNextButton")) ? pagingEnabled || this.option("showNextButton") : pagingEnabled;
                this._resumeDeprecatedWarnings();
                return $.extend(this.callBase(), {paginate: pagingEnabled})
            },
            _inputWrapper: function() {
                return this.element().find("." + LOOKUP_FIELD_WRAPPER_CLASS)
            },
            _render: function() {
                this.callBase();
                this.element().addClass(LOOKUP_CLASS).toggleClass(LOOKUP_POPOVER_MODE, this.option("usePopover"))
            },
            _fireContentReadyAction: $.noop,
            _popupWrapperClass: function() {
                return ""
            },
            _renderInput: function() {
                var fieldClickAction = this._createAction($.proxy(function() {
                        this._validatedOpening()
                    }, this));
                this._$field = $("<div>").addClass(LOOKUP_FIELD_CLASS).on(events.addNamespace("dxclick", this.NAME), function(e) {
                    fieldClickAction({jQueryEvent: e})
                });
                this._$fieldWrapper = $("<div>").addClass(LOOKUP_FIELD_WRAPPER_CLASS).append(this._$field).appendTo(this.element())
            },
            _popupShowingHandler: function() {
                var validationError;
                if (this._$popupValidationMessage) {
                    validationError = this.option("validationError");
                    if (validationError && validationError.message) {
                        this._$popupValidationMessage.text(validationError.message);
                        this._$popupValidationMessage.show()
                    }
                    else
                        this._$popupValidationMessage.hide()
                }
                this.callBase.apply(this, arguments);
                if (this.option("cleanSearchOnOpening")) {
                    this.option("searchEnabled") && this._searchBox.option("value", "");
                    this._list && this._list.option("focusedElement", null)
                }
            },
            _popupPositionedHandler: function() {
                if (this.option("usePopover"))
                    this._updatePopoverHeight()
            },
            _updatePopoverHeight: function() {
                if (!this._isInitialOptionValue("popupHeight"))
                    return;
                var listHeight = 0,
                    topSpace = this._popup.content().position().top,
                    bottomSpace = this._popup.bottomToolbar() ? this._popup.bottomToolbar().outerHeight(true) : 0,
                    contentPaddings = topSpace + bottomSpace;
                if (this._list) {
                    listHeight += this._list.element().position().top;
                    listHeight += this._list.element().outerHeight() - this._list.clientHeight();
                    listHeight += this._list.scrollHeight()
                }
                this._popup.overlayContent().css("maxHeight", "none");
                var popupHeight = Math.min(listHeight + contentPaddings, this._popup.overlayContent().outerHeight());
                this._popup.overlayContent().css("maxHeight", popupHeight);
                this._list && this._list.updateDimensions()
            },
            _renderPopup: function() {
                if (this.option("usePopover") && !this.option("fullScreen"))
                    this._renderPopover();
                else
                    this.callBase();
                this._$popup.addClass(LOOKUP_POPUP_CLASS);
                this._popup._wrapper().addClass(LOOKUP_POPUP_WRAPPER_CLASS)
            },
            _popupOptionMap: function(optionName) {
                return POPUP_OPTION_MAP[optionName] || optionName
            },
            _renderPopover: function() {
                this._popup = this._createComponent(this._$popup, "dxPopover", $.extend(this._popupConfig(), {
                    target: this.element(),
                    fullScreen: false,
                    shading: false,
                    closeOnTargetScroll: true,
                    closeOnOutsideClick: true,
                    width: this._isInitialOptionValue("popupWidth") ? this.element().width() : this._popupConfig().width
                }));
                this._popup.on({
                    showing: $.proxy(this._popupShowingHandler, this),
                    shown: $.proxy(this._popupShownHandler, this),
                    hiding: $.proxy(this._popupHidingHandler, this),
                    hidden: $.proxy(this._popupHiddenHandler, this),
                    positioned: $.proxy(this._popupPositionedHandler, this)
                });
                this._popup.option("onContentReady", $.proxy(this._contentReadyHandler, this));
                this._contentReadyHandler()
            },
            _popupHidingHandler: function() {
                this.callBase();
                this.option("focusStateEnabled") && this.focus()
            },
            _preventFocusOnPopup: $.noop,
            _popupConfig: function() {
                var result = $.extend(this.callBase(), {
                        onShowing: null,
                        showTitle: this.option("showPopupTitle"),
                        title: this.option("title"),
                        titleTemplate: this._getTemplateByOption("titleTemplate"),
                        onTitleRendered: this.option("onTitleRendered"),
                        buttons: this._getPopupButtons(),
                        fullScreen: this.option("fullScreen"),
                        shading: this.option("shading"),
                        closeOnTargetScroll: false,
                        closeOnOutsideClick: this.option("closeOnOutsideClick")
                    });
                delete result.animation;
                delete result.position;
                $.each(["position", "animation", "popupWidth", "popupHeight"], $.proxy(function(_, optionName) {
                    if (this.option(optionName) !== undefined)
                        result[this._popupOptionMap(optionName)] = this.option(optionName)
                }, this));
                return result
            },
            _getPopupButtons: function() {
                var buttonsConfig = this.option("applyValueMode") === "useButtons" ? this._popupButtonsConfig() : [];
                var cancelButton = this._getCancelButtonConfig();
                if (cancelButton)
                    buttonsConfig.push(cancelButton);
                var clearButton = this._getClearButtonConfig();
                if (clearButton)
                    buttonsConfig.push(clearButton);
                return this._applyButtonsLocation(buttonsConfig)
            },
            _popupButtonsConfig: function() {
                return [{
                            shortcut: "done",
                            options: {
                                onClick: $.proxy(this._applyButtonHandler, this),
                                text: this.option("applyButtonText")
                            }
                        }]
            },
            _getCancelButtonConfig: function() {
                return this.option("showCancelButton") ? {
                        shortcut: "cancel",
                        onClick: $.proxy(this._cancelButtonHandler, this),
                        options: {text: this.option("cancelButtonText")}
                    } : null
            },
            _getClearButtonConfig: function() {
                return this.option("showClearButton") ? {
                        shortcut: "clear",
                        onClick: $.proxy(this._resetValue, this),
                        options: {text: this.option("clearButtonText")}
                    } : null
            },
            _applyButtonHandler: function() {
                this.option("value", this._valueGetter(this._currentSelectedItem()));
                this.callBase()
            },
            _cancelButtonHandler: function() {
                this._refreshSelected();
                this.callBase()
            },
            _refreshPopupVisibility: $.noop,
            _dimensionChanged: function() {
                if (this.option("usePopover") && !this.option("popupWidth"))
                    this.option("popupWidth", this.element().width())
            },
            _input: function() {
                return this._$searchBox || this.callBase()
            },
            _renderPopupContent: function() {
                if (this._popup.NAME === "dxPopup")
                    this._$popupValidationMessage = $("<div/>").addClass(LOOKUP_POPUP_VALIDATION_MESSAGE).appendTo(this._popup.content());
                this._renderSearch();
                this.callBase()
            },
            _renderSearch: function() {
                var $searchWrapper = this._$searchWrapper = $("<div>").addClass(LOOKUP_SEARCH_WRAPPER_CLASS);
                var $searchBox = this._$searchBox = $("<div>").addClass(LOOKUP_SEARCH_CLASS).appendTo($searchWrapper);
                var currentDevice = DX.devices.current(),
                    searchMode = currentDevice.android && currentDevice.version[0] >= 5 ? "text" : "search";
                this._searchBox = this._createComponent($searchBox, "dxTextBox", {
                    mode: searchMode,
                    showClearButton: true,
                    valueChangeEvent: this.option("valueChangeEvent"),
                    onValueChanged: $.proxy(this._search, this)
                });
                this._searchBox.registerKeyHandler("escape", $.proxy(function(e) {
                    this.close()
                }, this));
                $searchWrapper.appendTo(this._popup.content());
                this._renderSearchVisibility();
                this._setSearchPlaceholder()
            },
            _renderSearchVisibility: function() {
                if (this._popup) {
                    var searchEnabled = this.option("searchEnabled");
                    this._popup._wrapper().toggleClass(LOOKUP_POPUP_SEARCH_CLASS, searchEnabled);
                    this._$searchWrapper.toggle(searchEnabled)
                }
            },
            _setSearchPlaceholder: function() {
                if (!this._$searchBox)
                    return;
                var minSearchLength = this.option("minSearchLength");
                var placeholder = this.option("searchPlaceholder");
                if (minSearchLength && placeholder === Globalize.localize("Search"))
                    placeholder = utils.stringFormat(Globalize.localize("dxLookup-searchPlaceholder"), minSearchLength);
                this._searchBox.option("placeholder", placeholder)
            },
            _renderList: function() {
                this.callBase();
                this._list.registerKeyHandler("escape", $.proxy(function(e) {
                    this.close()
                }, this))
            },
            _listConfig: function() {
                return $.extend(this.callBase(), {
                        tabIndex: 0,
                        grouped: this.option("grouped"),
                        groupTemplate: this._getTemplateByOption("groupTemplate"),
                        pullRefreshEnabled: this.option("pullRefreshEnabled"),
                        useNativeScrolling: this.option("useNativeScrolling"),
                        pullingDownText: this.option("pullingDownText"),
                        pulledDownText: this.option("pulledDownText"),
                        refreshingText: this.option("refreshingText"),
                        pageLoadingText: this.option("pageLoadingText"),
                        onScroll: this.option("onScroll"),
                        onPullRefresh: this.option("onPullRefresh"),
                        onPageLoading: this.option("onPageLoading"),
                        pageLoadMode: this._getPageLoadMode(),
                        nextButtonText: this.option("nextButtonText")
                    })
            },
            _listContentReadyHandler: function() {
                if (this.option("usePopover"))
                    this._popup.repaint();
                this.callBase.apply(this, arguments)
            },
            _getPageLoadMode: function() {
                this._suppressDeprecatedWarnings();
                var result = utils.isDefined(this.option("showNextButton")) ? "nextButton" : this.option("pageLoadMode");
                this._resumeDeprecatedWarnings();
                return result
            },
            _setFocusPolicy: function() {
                if (!this.option("focusStateEnabled"))
                    return;
                if (this.option("searchEnabled"))
                    this._searchBox.focus();
                else
                    this._$list.focus()
            },
            _attachChildKeyboardEvents: $.noop,
            _focusTarget: function() {
                return this._$field
            },
            _keyboardEventBindingTarget: function() {
                return this._$field
            },
            _selectedItemClass: function() {
                return LOOKUP_SELECTED_CLASS
            },
            _listItemClickHandler: function(e) {
                if (this._currentSelectedItem() === e.itemData)
                    this._applyButtonHandler();
                this._setCurrentSelectedClass(e.jQueryEvent.target);
                if (this.option("applyValueMode") === "instantly")
                    this._applyButtonHandler()
            },
            _currentSelectedItem: function() {
                return this._listSelectedItemElements().data(LIST_ITEM_DATA_KEY)
            },
            _setCurrentSelectedClass: function(target) {
                this._listSelectedItemElements().removeClass(LOOKUP_SELECTED_CLASS);
                $(target).closest(LIST_ITEM_SELECTOR).addClass(LOOKUP_SELECTED_CLASS)
            },
            _resetValue: function() {
                this.option("value", null);
                this.option("opened", false)
            },
            _searchValue: function() {
                return this.option("searchEnabled") ? this._searchBox.option("value") : ""
            },
            _renderInputValue: function() {
                return this.callBase().always($.proxy(function() {
                        this._refreshField()
                    }, this))
            },
            _refreshField: function() {
                this._$field.text(this.option("displayValue") || this.option("placeholder"));
                this.element().toggleClass(LOOKUP_EMPTY_CLASS, !this.option("selectedItem"))
            },
            _clean: function() {
                this._$fieldWrapper.remove();
                this._$searchBox = null;
                this.callBase()
            },
            _optionChanged: function(args) {
                var name = args.name;
                var value = args.value;
                switch (name) {
                    case"searchEnabled":
                        this._renderSearchVisibility();
                        break;
                    case"searchPlaceholder":
                        this._setSearchPlaceholder();
                        break;
                    case"minSearchLength":
                        this._setSearchPlaceholder();
                        this.callBase.apply(this, arguments);
                        break;
                    case"title":
                    case"titleTemplate":
                    case"onTitleRendered":
                    case"shading":
                    case"animation":
                    case"position":
                    case"closeOnOutsideClick":
                        this._setPopupOption(name);
                        break;
                    case"fullScreen":
                    case"usePopover":
                        this._invalidate();
                        break;
                    case"clearButtonText":
                    case"showClearButton":
                    case"showCancelButton":
                        this._setPopupOption("buttons", this._getPopupButtons());
                        break;
                    case"showDoneButton":
                        this.option("applyValueMode", value ? "useButtons" : "instantly");
                        break;
                    case"applyValueMode":
                        this.option("showDoneButton", value === "useButtons");
                        this.callBase.apply(this, arguments);
                        break;
                    case"popupWidth":
                        this._setPopupOption("popupWidth", value === "auto" ? this.initialOption("popupWidth") : value);
                        break;
                    case"popupHeight":
                        this._setPopupOption("popupHeight", value === "auto" ? this.initialOption("popupHeight") : value);
                        break;
                    case"pullRefreshEnabled":
                    case"useNativeScrolling":
                    case"pullingDownText":
                    case"pulledDownText":
                    case"refreshingText":
                    case"pageLoadingText":
                    case"onScroll":
                    case"onPullRefresh":
                    case"onPageLoading":
                    case"nextButtonText":
                    case"grouped":
                    case"groupTemplate":
                        this._setListOption(name);
                        break;
                    case"showNextButton":
                    case"pageLoadMode":
                        this._setListOption("pageLoadMode", this._getPageLoadMode());
                        break;
                    case"cleanSearchOnOpening":
                        break;
                    default:
                        this.callBase.apply(this, arguments)
                }
            },
            focus: function() {
                this.option("opened") ? this._setFocusPolicy() : this._focusTarget().focus()
            },
            field: function() {
                return this._$field
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.autocomplete.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            utils = DX.utils;
        var AUTOCOMPLETE_CLASS = "dx-autocomplete",
            AUTOCOMPLETE_POPUP_WRAPPER_CLASS = "dx-autocomplete-popup-wrapper",
            LIST_ITEM_DATA_KEY = "dxListItemData",
            CONTROL_KEY = {
                "9": "tab",
                "13": "enter",
                "16": "shift",
                "17": "ctrl",
                "18": "alt",
                "27": "escape",
                "33": "pageUp",
                "34": "pageDown",
                "35": "end",
                "36": "home",
                "37": "leftArrow",
                "38": "upArrow",
                "39": "rightArrow",
                "40": "downArrow"
            };
        DX.registerComponent("dxAutocomplete", ui, ui.dxDropDownList.inherit({
            _supportedKeys: function() {
                var item = this._list ? this._list.option("focusedElement") : null;
                return $.extend(this.callBase(), {
                        upArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (item && !item.prev().length) {
                                this._clearFocusedItem();
                                return false
                            }
                            return true
                        },
                        downArrow: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (item && !item.next().length) {
                                this._clearFocusedItem();
                                return false
                            }
                            return true
                        },
                        enter: function(e) {
                            if (!item)
                                this.close();
                            return true
                        }
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {displayExpr: {
                        since: "14.2",
                        alias: "valueExpr"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    minSearchLength: 1,
                    maxItemCount: 10,
                    noDataText: "",
                    showDropButton: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return device.platform === "android"
                            },
                            options: {dropPosition: {offset: {
                                        h: -16,
                                        v: -9
                                    }}}
                        }])
            },
            _render: function() {
                this.callBase();
                this.element().addClass(AUTOCOMPLETE_CLASS);
                this.setAria("autocomplete", "inline")
            },
            _loadValue: function() {
                return $.Deferred().resolve(this.option("value"))
            },
            _displayGetterExpr: function() {
                return this.option("valueExpr")
            },
            _setSelectedItem: function(item) {
                this.callBase(item);
                this.option("displayValue", this.option("value"))
            },
            _popupConfig: function() {
                return $.extend(this.callBase(), {closeOnOutsideClick: $.proxy(function(e) {
                            return !$(e.target).closest(this.element()).length
                        }, this)})
            },
            _renderDimensions: function() {
                this.callBase();
                this._setPopupOption("width")
            },
            _hasItemsToShow: function() {
                var resultItems = this._dataSource && this._dataSource.items() || [];
                var value = this.option("value");
                var firstResultValue = this._displayGetter(resultItems[0]) || "";
                var firstResultValueShorterThanValue = firstResultValue.length < (value || "").length;
                return this.callBase() && !firstResultValueShorterThanValue
            },
            _popupWrapperClass: function() {
                return this.callBase() + " " + AUTOCOMPLETE_POPUP_WRAPPER_CLASS
            },
            _listConfig: function() {
                return $.extend(this.callBase(), {
                        pageLoadMode: "none",
                        indicateLoading: false
                    })
            },
            _listItemClickHandler: function(e) {
                var value = this._displayGetter(e.itemData);
                this.option("value", value);
                this.close()
            },
            _refreshSelected: $.noop,
            _searchCanceled: function() {
                this.callBase();
                this.close()
            },
            _dataSourceOptions: function() {
                return {paginate: true}
            },
            _searchDataSource: function() {
                this._dataSource.pageSize(this.option("maxItemCount"));
                this.callBase();
                this._clearFocusedItem()
            },
            _clearFocusedItem: function() {
                if (this._list) {
                    this._list.option("focusedElement", null);
                    this._list.option("selectedIndex", -1)
                }
            },
            _renderValueEventName: function() {
                return "input keyup"
            },
            _keyUpHandler: function(e) {
                if (CONTROL_KEY[e.which || e.keyCode])
                    return;
                this.callBase.apply(this, arguments);
                this._search()
            },
            _optionChanged: function(args) {
                if (args.name === "maxItemCount")
                    this._searchDataSource();
                else
                    this.callBase(args)
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.selectBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            SELECTBOX = "dxSelectBox",
            SELECTBOX_CLASS = "dx-selectbox",
            SELECTBOX_POPUP_CLASS = "dx-selectbox-popup",
            SELECTBOX_SELECTED_CLASS = "dx-selectbox-selected",
            SELECTBOX_CONTAINER_CLASS = "dx-selectbox-container",
            SELECTBOX_POPUP_WRAPPER_CLASS = "dx-selectbox-popup-wrapper",
            BLUR_EVENT_NAME = events.addNamespace("blur", SELECTBOX),
            CLICK_EVENT_NAME = events.addNamespace("dxclick", SELECTBOX),
            CONTROL_KEY = {
                "9": "tab",
                "13": "enter",
                "16": "shift",
                "17": "ctrl",
                "18": "alt",
                "27": "escape",
                "33": "pageUp",
                "34": "pageDown",
                "35": "end",
                "36": "home",
                "37": "leftArrow",
                "38": "upArrow",
                "39": "rightArrow",
                "40": "downArrow"
            };
        DX.registerComponent(SELECTBOX, ui, ui.dxDropDownList.inherit({
            _supportedKeys: function() {
                var parent = this.callBase(),
                    clearSelectBox = function(e) {
                        if (this.option("showClearButton")) {
                            e.preventDefault();
                            this.reset()
                        }
                    };
                return $.extend({}, parent, {
                        upArrow: function(e) {
                            if (parent.upArrow.apply(this, arguments)) {
                                if (!this.option("opened"))
                                    this._setNextValue(-1);
                                return true
                            }
                        },
                        downArrow: function(e) {
                            if (parent.downArrow.apply(this, arguments)) {
                                if (!this.option("opened"))
                                    this._setNextValue(1);
                                return true
                            }
                        },
                        enter: function(e) {
                            if (parent.enter.apply(this, arguments))
                                return this.option("opened")
                        },
                        backspace: clearSelectBox,
                        del: clearSelectBox
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    placeholder: Globalize.localize("Select"),
                    fieldTemplate: null,
                    valueChangeEvent: "keyup",
                    fieldEditEnabled: false,
                    showSelectionControls: false,
                    tooltipEnabled: false,
                    openOnFieldClick: true,
                    showDropButton: true,
                    displayCustomValue: false,
                    _isAdaptableDropPosition: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: {platform: "win8"},
                            options: {
                                _isAdaptableDropPosition: true,
                                dropPosition: {
                                    at: "left top",
                                    offset: {
                                        h: 0,
                                        v: 0
                                    }
                                }
                            }
                        }, {
                            device: function(device) {
                                return device.platform === "android"
                            },
                            options: {
                                _isAdaptableDropPosition: true,
                                dropPosition: {
                                    my: "top left",
                                    at: "top left",
                                    offset: {
                                        h: -16,
                                        v: -8
                                    }
                                }
                            }
                        }])
            },
            _selectedItemClass: function() {
                return SELECTBOX_SELECTED_CLASS
            },
            _render: function() {
                this.callBase();
                this.element().addClass(SELECTBOX_CLASS);
                this._renderTooltip()
            },
            _createPopup: function() {
                this.callBase();
                this._updatePopupPosition();
                this._popup.element().addClass(SELECTBOX_POPUP_CLASS)
            },
            _popupWrapperClass: function() {
                return this.callBase() + " " + SELECTBOX_POPUP_WRAPPER_CLASS
            },
            _renderOpenedState: function() {
                this.callBase();
                if (this.option("opened")) {
                    this._updatePopupHeight();
                    this._scrollToSelectedItem()
                }
            },
            _updatePopupPosition: function() {
                if (!this.option("_isAdaptableDropPosition") || this.option("dropPosition") !== this.initialOption("dropPosition"))
                    return;
                if (this.option("fieldEditEnabled") || this.option("searchEnabled")) {
                    var adaptablePopupPosition = $.extend(this._getDefaultDropPosition(), {offset: {
                                h: this.option("dropPosition").offset.h,
                                v: -4
                            }});
                    this._setPopupOption("position", adaptablePopupPosition)
                }
                else
                    this._setPopupOption("position", this.initialOption("dropPosition"))
            },
            _scrollToSelectedItem: function() {
                if (this._dataSource.paginate() && this._isEditable())
                    this._list.scrollTo(0);
                else
                    this._list.scrollToItem(this._$list.find("." + this._selectedItemClass()))
            },
            _renderInputValue: function() {
                return this.callBase().always($.proxy(function() {
                        this._renderTooltip();
                        this._renderInputAddons()
                    }, this))
            },
            _fitIntoRange: function(value, start, end) {
                if (value > end)
                    return start;
                if (value < start)
                    return end;
                return value
            },
            _setNextValue: function(step) {
                if (!this._dataSource.isLoaded())
                    this._loadDataSource();
                var item = this.option("selectedItem"),
                    items = this._dataSource.items(),
                    itemIndex = $.inArray(item, items),
                    nextIndex = this._fitIntoRange(itemIndex + step, 0, items.length - 1);
                this._setValue(this._valueGetter(items[nextIndex]))
            },
            _setSelectedItem: function(item) {
                var isUnknownItem = !this._isCustomValueAllowed() && item === undefined;
                this.callBase(isUnknownItem ? null : item)
            },
            _isCustomValueAllowed: function() {
                return this.option("fieldEditEnabled") || this.option("displayCustomValue")
            },
            _displayValue: function(item) {
                item = !DX.utils.isDefined(item) && this._isCustomValueAllowed() ? this.option("value") : item;
                return this.callBase(item)
            },
            _listConfig: function() {
                var result = $.extend(this.callBase(), {
                        pageLoadMode: "scrollBottom",
                        noDataText: "",
                        onSelectionChanged: this._getSelectionChangeHandler(),
                        selectionMode: "single"
                    });
                if (this.option("showSelectionControls"))
                    $.extend(result, {showSelectionControls: true});
                return result
            },
            _getSelectionChangeHandler: function() {
                return this.option("showSelectionControls") ? $.proxy(this._selectionChangeHandler, this) : $.noop
            },
            _selectionChangeHandler: function(e) {
                $.each(e.addedItems || [], $.proxy(function(_, addedItem) {
                    this._setValue(this._valueGetter(addedItem))
                }, this))
            },
            _toggleOpenState: function() {
                this.callBase.apply(this, arguments);
                if (this.option("opened") && this._isEditable())
                    this._filterDataSource("")
            },
            _renderTooltip: function() {
                if (this.option("tooltipEnabled"))
                    this.element().attr("title", this.option("displayValue"))
            },
            _renderDimensions: function() {
                this.callBase();
                this._setPopupOption("width")
            },
            _renderInput: function() {
                this.callBase();
                this._$container.addClass(SELECTBOX_CONTAINER_CLASS);
                this._input().off(BLUR_EVENT_NAME).on(BLUR_EVENT_NAME, $.proxy(this._fieldBlurHandler, this))
            },
            _fieldBlurHandler: function() {
                if (this.option("searchEnabled") && !this.option("fieldEditEnabled")) {
                    var selectedItem = this.option("selectedItem");
                    this._renderInputValue().always($.proxy(function(e) {
                        this._setSelectedItem(selectedItem);
                        this._renderDisplayText(this._displayGetter(this.option("selectedItem")))
                    }, this))
                }
            },
            _renderValueChangeEvent: function() {
                if (this._isEditable())
                    this.callBase()
            },
            _isEditable: function() {
                return this.option("fieldEditEnabled") || this.option("searchEnabled")
            },
            _fieldRenderData: function() {
                return this.option("selectedItem")
            },
            _readOnlyPropValue: function() {
                return !this._isEditable() || this.option("readOnly")
            },
            _isSelectedValue: function(value) {
                return this._isValueEquals(value, this.option("value"))
            },
            _listItemClickHandler: function(e) {
                this._completeSelection(this._valueGetter(e.itemData))
            },
            _completeSelection: function(value) {
                if (value === undefined)
                    value = this.option("fieldEditEnabled") && this._searchValue() ? this._searchValue() : this.option("value");
                this.option("opened", false);
                this._clearFilter();
                this._setValue(value)
            },
            _setValue: function(value) {
                this.option("value", value)
            },
            _clearValueHandler: function() {
                this.reset()
            },
            _valueChangeEventHandler: function(e) {
                if (CONTROL_KEY[e.which || e.keyCode])
                    return;
                if (this.option("fieldEditEnabled")) {
                    this._valueUpdateSuppressed = true;
                    this.callBase.apply(this, arguments);
                    this._valueUpdateSuppressed = false
                }
                if (this.option("searchEnabled"))
                    this._search()
            },
            _createClearButton: function() {
                return this.callBase().on(CLICK_EVENT_NAME, function() {
                        return false
                    })
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"_isAdaptableDropPosition":
                        break;
                    case"tooltipEnabled":
                        this._renderTooltip();
                        break;
                    case"displayCustomValue":
                    case"fieldEditEnabled":
                    case"showSelectionControls":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tagBox.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            TAGBOX = "dxTagBox",
            TAGBOX_TAG_DATA_KEY = "dxTagData",
            TAGBOX_CLASS = "dx-tagbox",
            TAGBOX_TAG_CONTAINER_CLASS = "dx-tag-container",
            TAGBOX_TAG_CLASS = "dx-tag",
            TAGBOX_TAG_CONTENT_CLASS = "dx-tag-content",
            TAGBOX_TAG_REMOVE_BUTTON_CLASS = "dx-tag-remove-button",
            TAGBOX_ONLY_SELECT_CLASS = "dx-tagbox-only-select",
            EMPTY_INPUT_CLASS = "dx-texteditor-empty",
            TAGBOX_TAG_REMOVE_CLICK_EVENT_NAME = events.addNamespace("dxclick", TAGBOX + "TagRemove");
        var dxTagRemoveButton = ui.Widget.inherit({
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({activeStateEnabled: true})
                },
                _render: function() {
                    this.callBase();
                    this.element().addClass(TAGBOX_TAG_REMOVE_BUTTON_CLASS)
                }
            });
        DX.registerComponent(TAGBOX, ui, ui.dxSelectBox.inherit({
            _supportedKeys: function() {
                var parent = this.callBase();
                return $.extend(parent, {
                        backspace: function(e) {
                            if (this._searchValue().length)
                                return;
                            e.preventDefault();
                            e.stopPropagation();
                            var values = this.option("values");
                            this._removeTagWithUpdate(values[values.length - 1])
                        },
                        enter: function(e) {
                            if (this.option("fieldEditEnabled") && !this._$list.find(".dx-state-focused").length)
                                this._completeSelection();
                            else
                                this._keyboardProcessor._childProcessors[0].process(e)
                        }
                    })
            },
            _setNextValue: $.noop,
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    values: [],
                    onValuesChanged: null,
                    showDropButton: false,
                    tagTemplate: 'tag',
                    selectAllText: Globalize.localize("dxList-selectAll")
                })
            },
            _init: function() {
                this.callBase();
                this._initValuesChangedAction()
            },
            _initValuesChangedAction: function() {
                this._valuesChangedAction = this._createActionByOption("onValuesChanged");
                this._removeTagAction = this._createAction($.proxy(this._removeTagHandler, this))
            },
            _render: function() {
                this.callBase();
                this._updateValues();
                this.element().addClass(TAGBOX_CLASS);
                this.element().toggleClass(TAGBOX_ONLY_SELECT_CLASS, !(this.option("searchEnabled") || this.option("fieldEditEnabled")));
                this.element().find(".dx-texteditor-container").off(TAGBOX_TAG_REMOVE_CLICK_EVENT_NAME).on(TAGBOX_TAG_REMOVE_CLICK_EVENT_NAME, "." + TAGBOX_TAG_REMOVE_BUTTON_CLASS, $.proxy(function(e) {
                    this._removeTagAction({jQueryEvent: e})
                }, this))
            },
            _renderInputValue: function() {
                return this.callBase().always($.proxy(function() {
                        this._renderMultiSelect()
                    }, this))
            },
            _listContentReadyHandler: function() {
                this._suppressingSelectionChanged(function() {
                    this._valuesChangedAction = $.noop;
                    this._setListOption("selectedItems", this._selectedItems)
                });
                this.callBase();
                this._initValuesChangedAction()
            },
            _suppressingSelectionChanged: function(callback) {
                this._setListOption("onSelectionChanged", $.noop);
                callback.call(this);
                this._setListOption("onSelectionChanged", this._getSelectionChangeHandler())
            },
            _listConfig: function() {
                var config = this.callBase();
                if (this.option("showSelectionControls"))
                    $.extend(config, {
                        selectionMode: "all",
                        selectAllText: this.option("selectAllText")
                    });
                return config
            },
            _renderMultiSelect: function() {
                this._$tagsContainer = this.element().find(".dx-texteditor-container").addClass(TAGBOX_TAG_CONTAINER_CLASS);
                this._renderInputSize();
                this._clearFilter();
                this._renderTags();
                this._popup && this._popup.repaint()
            },
            _renderInputSize: function() {
                var $input = this._input();
                $input.prop("size", $input.val() ? $input.val().length + 2 : 1)
            },
            _renderTags: function() {
                this._cleanTags();
                var $tagsBag = $("<div>");
                this._selectedItems = [];
                var itemLoadDeferreds = $.map(this._values(), $.proxy(function(value) {
                        return this._renderTag(value, $tagsBag)
                    }, this));
                $tagsBag.children().insertBefore(this._input());
                $.when.apply($, itemLoadDeferreds).done($.proxy(this._renderInputAddons, this));
                this._renderEmptyState()
            },
            _renderEmptyState: function() {
                var hasNoValues = !this._values().length;
                this.element().toggleClass(EMPTY_INPUT_CLASS, hasNoValues);
                this._placeholder().toggle(hasNoValues);
                this._renderDisplayText()
            },
            _renderDisplayText: function() {
                this._input().val("");
                this._renderInputSize()
            },
            _cleanTags: function() {
                var $tags = this._tagElements();
                var values = this.option("values");
                $.each($tags, function(_, tag) {
                    var $tag = $(tag);
                    if ($.inArray($tag.data(TAGBOX_TAG_DATA_KEY), values) < 0)
                        $tag.remove()
                })
            },
            _tagElements: function() {
                return this.element().find("." + TAGBOX_TAG_CLASS)
            },
            _renderTag: function(value, $container) {
                if (this._isTagRendered(value))
                    return $.Deferred().resolve();
                var $tag = $("<div>").addClass(TAGBOX_TAG_CLASS).data(TAGBOX_TAG_DATA_KEY, value).appendTo($container),
                    tagTemplate = this._getTemplateByOption("tagTemplate");
                $("<div>").dxTagRemoveButton().appendTo($tag);
                return this._loadItem(value).always($.proxy(function(item) {
                        var data = DX.utils.isDefined(item) ? this._displayGetter(item) : value;
                        tagTemplate.render(data, $tag);
                        this._selectedItems.push(DX.utils.isDefined(item) ? item : value)
                    }, this))
            },
            _isTagRendered: function(value) {
                var $tags = this._tagElements();
                var result = false;
                $.each($tags, function(_, tag) {
                    var $tag = $(tag);
                    if (value === $tag.data(TAGBOX_TAG_DATA_KEY)) {
                        result = true;
                        return false
                    }
                });
                return result
            },
            _toggleEmptinessEventHandler: function() {
                this._toggleEmptiness(!this.option("values").length && !this._searchValue().length)
            },
            _removeTagHandler: function(args) {
                var e = args.jQueryEvent;
                e.stopPropagation();
                var $tag = $(e.target).closest("." + TAGBOX_TAG_CLASS);
                var itemValue = $tag.data(TAGBOX_TAG_DATA_KEY);
                this._removeTagWithUpdate(itemValue)
            },
            _removeTagWithUpdate: function(itemValue) {
                this._removeTag(itemValue);
                this._suppressingSelectionChanged(function() {
                    this._updateValues()
                });
                this.option("values", this.option("values"))
            },
            _selectionChangeHandler: function(e) {
                $.each(e.removedItems || [], $.proxy(function(_, removedItem) {
                    this._removeTag(this._valueGetter(removedItem))
                }, this));
                $.each(e.addedItems || [], $.proxy(function(_, addedItem) {
                    this._addTag(this._valueGetter(addedItem))
                }, this));
                this.callBase(e);
                this._updateValues();
                this._valuesChangedAction(e)
            },
            _removeTag: function(value) {
                this.option().value = value;
                var values = this.option("values"),
                    index = this._valueIndex(value);
                if (index >= 0)
                    values.splice(index, 1)
            },
            _addTag: function(value) {
                var values = this.option("values"),
                    index = this._valueIndex(value);
                if (index < 0)
                    values.push(value)
            },
            _fieldRenderData: function() {
                return this._selectedItems
            },
            _setValue: function(value) {
                if (value === null || this._isSelectedValue(value))
                    return;
                var values = this.option("values");
                values.push(value);
                this.option("values", values)
            },
            _isSelectedValue: function(value) {
                return this._valueIndex(value) > -1
            },
            _valueIndex: function(value) {
                var result = -1;
                $.each(this._values(), $.proxy(function(index, selectedValue) {
                    if (this._isValueEquals(value, selectedValue)) {
                        result = index;
                        return false
                    }
                }, this));
                return result
            },
            _values: function() {
                return this.option("values") || []
            },
            _optionValuesEqual: function(name, value, prevValue) {
                if (name === "value")
                    return false;
                this.callBase(name, value, prevValue)
            },
            reset: function() {
                this.option("values", []);
                this.callBase()
            },
            _updateValues: function() {
                var lastValue = this._lastValue() === undefined ? null : this._lastValue();
                this.option("value", lastValue)
            },
            _lastValue: function() {
                return this._values().slice(-1).pop()
            },
            _valueChangeEventHandler: function(e) {
                this._renderInputSize();
                if (this.option("fieldEditEnabled"))
                    return;
                this.callBase(e)
            },
            _valueChangeArgs: function() {
                var result = this.callBase.apply(this, arguments);
                delete result.previousValue;
                return $.extend(result, {values: this.option("values")})
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"displayExpr":
                        this.callBase(args);
                        this._invalidate();
                        break;
                    case"tagTemplate":
                        this._invalidate();
                        break;
                    case"values":
                        this._updateValues();
                        break;
                    case"onValuesChanged":
                        this._initValuesChangedAction();
                        break;
                    case"selectAllText":
                        this._setListOption("selectAllText", this.option("selectAllText"));
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }));
        DX.registerComponent("dxTagRemoveButton", ui[TAGBOX], dxTagRemoveButton)
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.multiView.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils,
            fx = DX.fx,
            translator = DX.translator;
        var MULTIVIEW_CLASS = "dx-multiview",
            MULTIVIEW_AUTOHEIGHT_CLASS = "dx-multiview-autoheight",
            MULTIVIEW_WRAPPER_CLASS = "dx-multiview-wrapper",
            MULTIVIEW_ITEM_CONTAINER_CLASS = "dx-multiview-item-container",
            MULTIVIEW_ITEM_CLASS = "dx-multiview-item",
            MULTIVIEW_ITEM_HIDDEN_CLASS = "dx-multiview-item-hidden",
            MULTIVIEW_ITEM_DATA_KEY = "dxMultiViewItemData",
            MULTIVIEW_ANIMATION_DURATION = 200;
        var toNumber = function(value) {
                return +value
            };
        var position = function($element) {
                return translator.locate($element).left
            };
        var move = function($element, position) {
                translator.move($element, {left: position})
            };
        var animation = {
                moveTo: function($element, position, duration, completeAction) {
                    fx.animate($element, {
                        type: "slide",
                        to: {left: position},
                        duration: duration,
                        complete: completeAction
                    })
                },
                complete: function($element) {
                    fx.stop($element, true)
                }
            };
        DX.registerComponent("dxMultiView", ui, ui.CollectionWidget.inherit({
            _activeStateUnit: "." + MULTIVIEW_ITEM_CLASS,
            _supportedKeys: function() {
                return $.extend(this.callBase(), {
                        pageUp: $.noop,
                        pageDown: $.noop
                    })
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    selectedIndex: 0,
                    swipeEnabled: true,
                    animationEnabled: true,
                    loop: false,
                    deferRendering: true,
                    loopItemFocus: false,
                    selectOnFocus: true,
                    selectionMode: "single",
                    selectionRequired: true,
                    selectionByClick: false
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }])
            },
            _itemClass: function() {
                return MULTIVIEW_ITEM_CLASS
            },
            _itemDataKey: function() {
                return MULTIVIEW_ITEM_DATA_KEY
            },
            _itemContainer: function() {
                return this._$itemContainer
            },
            _itemWidth: function() {
                if (!this._itemWidthValue)
                    this._itemWidthValue = this._$wrapper.width();
                return this._itemWidthValue
            },
            _clearItemWidthCache: function() {
                delete this._itemWidthValue
            },
            _itemsCount: function() {
                return this.option("items").length
            },
            _normalizeIndex: function(index) {
                var count = this._itemsCount();
                if (index < 0)
                    index = index + count;
                if (index >= count)
                    index = index - count;
                return index
            },
            _getRTLSignCorrection: function() {
                return this.option("rtlEnabled") ? -1 : 1
            },
            _init: function() {
                this.callBase.apply(this, arguments);
                var $element = this.element();
                $element.addClass(MULTIVIEW_CLASS);
                this._$wrapper = $("<div>").addClass(MULTIVIEW_WRAPPER_CLASS);
                this._$wrapper.appendTo($element);
                this._$itemContainer = $("<div>").addClass(MULTIVIEW_ITEM_CONTAINER_CLASS);
                this._$itemContainer.appendTo(this._$wrapper);
                this.option("loopItemFocus", this.option("loop"));
                this._initSwipeable()
            },
            itemAttributes: function() {
                return {role: "tabpanel"}
            },
            _render: function() {
                this._deferredItems = [];
                this.callBase()
            },
            _renderItemContent: function(index, itemData, $container) {
                this._deferredItems.push($.Deferred());
                this._deferredItems[index].done($.proxy(function(itemContentRenderer, args) {
                    itemContentRenderer.apply(this, args)
                }, this, this.callBase, arguments));
                if (!this.option("deferRendering"))
                    this._deferredItems[index].resolve()
            },
            _renderSelection: function(addedSelection) {
                this._updateItems(addedSelection[0])
            },
            _updateItems: function(selectedIndex, newIndex) {
                this._updateItemsPosition(selectedIndex, newIndex);
                this._updateItemsVisibility(selectedIndex, newIndex)
            },
            _renderSpecificItem: function(index) {
                var hasItemContent = this._itemElements().eq(index).find(this._itemContentClass()).length > 0;
                if (DX.utils.isDefined(index) && !hasItemContent)
                    this._deferredItems[index].resolve()
            },
            _updateItemsPosition: function(selectedIndex, newIndex) {
                var $itemElements = this._itemElements(),
                    positionSign = -this._animationDirection(newIndex, selectedIndex),
                    $selectedItem = $itemElements.eq(selectedIndex);
                move($selectedItem, 0);
                move($itemElements.eq(newIndex), positionSign * 100 + "%")
            },
            _updateItemsVisibility: function(selectedIndex, newIndex) {
                var $itemElements = this._itemElements();
                $itemElements.each($.proxy(function(itemIndex, item) {
                    var $item = $(item),
                        isHidden = itemIndex !== selectedIndex && itemIndex !== newIndex;
                    if (!isHidden)
                        this._renderSpecificItem(itemIndex);
                    $item.toggleClass(MULTIVIEW_ITEM_HIDDEN_CLASS, isHidden);
                    this.setAria("hidden", isHidden || undefined, $item)
                }, this))
            },
            _setAriaSelected: $.noop,
            _updateSelection: function(addedSelection, removedSelection) {
                var newIndex = addedSelection[0],
                    prevIndex = removedSelection[0];
                animation.complete(this._$itemContainer);
                this._updateItems(prevIndex, newIndex);
                var animationDirection = this._animationDirection(newIndex, prevIndex);
                this._animateItemContainer(animationDirection * this._itemWidth(), $.proxy(function() {
                    move(this._$itemContainer, 0);
                    this._updateItems(newIndex);
                    this._$itemContainer.width()
                }, this))
            },
            _animateItemContainer: function(position, completeCallback) {
                var duration = this.option("animationEnabled") ? MULTIVIEW_ANIMATION_DURATION : 0;
                animation.moveTo(this._$itemContainer, position, duration, completeCallback)
            },
            _animationDirection: function(newIndex, prevIndex) {
                var containerPosition = position(this._$itemContainer),
                    indexDifference = (prevIndex - newIndex) * this._getRTLSignCorrection() * this._getItemFocusLoopSignCorrection(),
                    isSwipePresent = containerPosition !== 0,
                    directionSignVariable = isSwipePresent ? containerPosition : indexDifference;
                return utils.sign(directionSignVariable)
            },
            _initSwipeable: function() {
                this._createComponent(this.element(), "dxSwipeable", {
                    disabled: !this.option("swipeEnabled"),
                    elastic: false,
                    itemSizeFunc: $.proxy(this._itemWidth, this),
                    onStart: $.proxy(function(args) {
                        this._swipeStartHandler(args.jQueryEvent)
                    }, this),
                    onUpdated: $.proxy(function(args) {
                        this._swipeUpdateHandler(args.jQueryEvent)
                    }, this),
                    onEnd: $.proxy(function(args) {
                        this._swipeEndHandler(args.jQueryEvent)
                    }, this)
                })
            },
            _swipeStartHandler: function(e) {
                animation.complete(this._$itemContainer);
                var selectedIndex = this.option("selectedIndex"),
                    loop = this.option("loop"),
                    lastIndex = this._itemsCount() - 1,
                    rtl = this.option("rtlEnabled");
                e.maxLeftOffset = toNumber(loop || (rtl ? selectedIndex > 0 : selectedIndex < lastIndex));
                e.maxRightOffset = toNumber(loop || (rtl ? selectedIndex < lastIndex : selectedIndex > 0));
                this._swipeDirection = null
            },
            _swipeUpdateHandler: function(e) {
                var offset = e.offset,
                    swipeDirection = utils.sign(offset) * this._getRTLSignCorrection();
                move(this._$itemContainer, offset * 100 + "%");
                if (swipeDirection !== this._swipeDirection) {
                    this._swipeDirection = swipeDirection;
                    var selectedIndex = this.option("selectedIndex"),
                        newIndex = this._normalizeIndex(selectedIndex - swipeDirection);
                    this._updateItems(selectedIndex, newIndex)
                }
            },
            _swipeEndHandler: function(e) {
                var targetOffset = e.targetOffset * this._getRTLSignCorrection();
                if (targetOffset) {
                    this.option("selectedIndex", this._normalizeIndex(this.option("selectedIndex") - targetOffset));
                    var $selectedElement = this.itemElements().filter(".dx-item-selected");
                    this.option("focusedElement", $selectedElement)
                }
                else
                    this._animateItemContainer(0, $.noop)
            },
            _getItemFocusLoopSignCorrection: function() {
                return this._itemFocusLooped ? -1 : 1
            },
            _moveFocus: function() {
                this.callBase.apply(this, arguments);
                this._itemFocusLooped = false
            },
            _prevItem: function($items) {
                var $result = this.callBase.apply(this, arguments);
                this._itemFocusLooped = $result.is($items.last());
                return $result
            },
            _nextItem: function($items) {
                var $result = this.callBase.apply(this, arguments);
                this._itemFocusLooped = $result.is($items.first());
                return $result
            },
            _dimensionChanged: function() {
                this._clearItemWidthCache()
            },
            _visibilityChanged: function(visible) {
                if (visible)
                    this._dimensionChanged()
            },
            _optionChanged: function(args) {
                var value = args.value;
                switch (args.name) {
                    case"loop":
                        this.option("loopItemFocus", value);
                        break;
                    case"animationEnabled":
                        break;
                    case"swipeEnabled":
                        this.element().dxSwipeable("option", "disabled", !value);
                        break;
                    case"deferRendering":
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }));
        ui.dxMultiView.__internals = {animation: animation}
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.validator.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events,
            validationEngine = DX.validationEngine;
        var VALIDATOR_CLASS = "dx-validator";
        DevExpress.ui.validation.defaultAdapter = DX.Class.inherit({
            ctor: function(editor, validator) {
                var that = this;
                that.editor = editor;
                that.validator = validator;
                that.validationRequestsCallbacks = $.Callbacks();
                var handler = function(params) {
                        that.validationRequestsCallbacks.fire()
                    };
                editor.validationRequest.add(handler);
                editor.on("disposing", function() {
                    editor.validationRequest.remove(handler)
                })
            },
            getValue: function() {
                return this.editor.option("value")
            },
            getCurrentValidationError: function() {
                return this.editor.option("validationError")
            },
            applyValidationResults: function(params) {
                this.editor.option({
                    isValid: params.isValid,
                    validationError: params.brokenRule
                })
            },
            reset: function() {
                this.editor.reset()
            },
            focus: function() {
                this.editor.focus()
            }
        });
        var dxValidator = DX.DOMComponent.inherit({
                _setDefaultOptions: function() {
                    this.callBase();
                    this.option({validationRules: []})
                },
                _init: function() {
                    this.callBase();
                    this._initGroupRegistration();
                    this.focused = $.Callbacks();
                    this._initAdapter()
                },
                _initGroupRegistration: function _initGroupRegistration() {
                    var group = this._findGroup();
                    if (!this._groupWasInit)
                        this.on("disposing", function(args) {
                            validationEngine.removeRegistredValidator(args.component._validationGroup, args.component)
                        });
                    if (!this._groupWasInit || this._validationGroup !== group) {
                        validationEngine.removeRegistredValidator(this._validationGroup, this);
                        this._groupWasInit = true;
                        this._validationGroup = group;
                        validationEngine.registerValidatorInGroup(group, this)
                    }
                },
                _setOptionsByReference: function() {
                    this.callBase();
                    $.extend(this._optionsByReference, {validationGroup: true})
                },
                _initAdapter: function() {
                    var that = this,
                        dxStandardEditor = that.element().data("dx-validation-target"),
                        adapter = that.option("adapter");
                    if (!adapter) {
                        if (dxStandardEditor) {
                            adapter = new DevExpress.ui.validation.defaultAdapter(dxStandardEditor, this);
                            adapter.validationRequestsCallbacks.add(function() {
                                that.validate()
                            });
                            this.option("adapter", adapter);
                            return
                        }
                        throw DX.Error("E0120");
                    }
                    if (adapter.validationRequestsCallbacks)
                        adapter.validationRequestsCallbacks.add(function() {
                            that.validate()
                        })
                },
                _findGroup: DX.ui.validation.findGroup,
                _render: function() {
                    this.element().addClass(VALIDATOR_CLASS);
                    this.callBase()
                },
                _optionChanged: function(args) {
                    switch (args.name) {
                        case"validationGroup":
                            this._initGroupRegistration();
                            return;
                        case"validationRules":
                            return;
                        case"adapter":
                            this._initAdapter();
                            break;
                        default:
                            this.callBase(args)
                    }
                },
                validate: function() {
                    var that = this,
                        adapter = that.option("adapter"),
                        name = that.option("name"),
                        value = adapter.getValue(),
                        currentError = adapter.getCurrentValidationError && adapter.getCurrentValidationError(),
                        rules = $.map(that.option("validationRules"), function(rule) {
                            rule.validator = that;
                            return rule
                        }),
                        result;
                    if (currentError && currentError.editorSpecific) {
                        currentError.validator = this;
                        result = {
                            isValid: false,
                            brokenRule: currentError
                        }
                    }
                    else
                        result = validationEngine.validate(value, rules, name);
                    this._applyValidationResult(result, adapter);
                    return result
                },
                reset: function() {
                    var that = this,
                        adapter = that.option("adapter"),
                        name = that.option("name"),
                        result = {
                            isValid: true,
                            brokenRule: null
                        };
                    adapter.reset();
                    this._applyValidationResult(result, adapter)
                },
                _applyValidationResult: function(result, adapter) {
                    var validatedAction = this._createActionByOption("onValidated");
                    result.validator = this;
                    adapter.applyValidationResults && adapter.applyValidationResults(result);
                    this.option({isValid: result.isValid});
                    validatedAction(result)
                },
                focus: function() {
                    var adapter = this.option("adapter");
                    adapter.focus()
                }
            });
        DX.registerComponent("dxValidator", ui, dxValidator)
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.validationGroup.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var VALIDATION_ENGINE_CLASS = "dx-validationgroup";
        DX.registerComponent("dxValidationGroup", ui, DX.DOMComponent.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({})
            },
            _init: function() {
                this.callBase()
            },
            _render: function() {
                var $element = this.element();
                $element.addClass(VALIDATION_ENGINE_CLASS);
                $element.find(".dx-validator").each(function(_, validatorContainer) {
                    $(validatorContainer).dxValidator("instance")._initGroupRegistration()
                });
                $element.find(".dx-validationsummary").each(function(_, summaryContainer) {
                    $(summaryContainer).dxValidationSummary("instance")._initGroupRegistration()
                });
                this.callBase()
            },
            validate: function() {
                return DX.validationEngine.validateGroup(this)
            },
            reset: function() {
                return DX.validationEngine.resetGroup(this)
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    default:
                        this.callBase(args)
                }
            },
            _dispose: function() {
                DX.validationEngine.removeGroup(this);
                this.element().removeClass(VALIDATION_ENGINE_CLASS);
                this.callBase()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.validationSummary.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            events = ui.events;
        var VALIDATION_SUMMARY_CLASS = "dx-validationsummary",
            ITEM_CLASS = VALIDATION_SUMMARY_CLASS + "-item",
            ITEM_DATA_KEY = VALIDATION_SUMMARY_CLASS + "-item-data";
        DX.registerComponent("dxValidationSummary", ui, ui.CollectionWidget.inherit({
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    focusStateEnabled: false,
                    noDataText: null
                })
            },
            _setOptionsByReference: function() {
                this.callBase();
                $.extend(this._optionsByReference, {validationGroup: true})
            },
            _findGroup: DX.ui.validation.findGroup,
            _init: function() {
                this.callBase();
                this._initGroupRegistration()
            },
            _initGroupRegistration: function() {
                var group = this._findGroup(),
                    groupConfig = DX.validationEngine.addGroup(group);
                this._unsubscribeGroup();
                this._groupWasInit = true;
                this._validationGroup = group;
                this.groupSubscription = $.proxy(this._groupValidationHandler, this);
                groupConfig.on("validated", this.groupSubscription)
            },
            _unsubscribeGroup: function() {
                var groupConfig = DX.validationEngine.getGroupConfig(this._validationGroup);
                groupConfig && groupConfig.off("validated", this.groupSubscription)
            },
            _getOrderedItems: function(validators, items) {
                var orderedItems = [];
                $.each(validators, function(_, validator) {
                    var firstItem = $.grep(items, function(item) {
                            if (item.validator === validator)
                                return true
                        })[0];
                    if (firstItem)
                        orderedItems.push(firstItem)
                });
                return orderedItems
            },
            _groupValidationHandler: function(params) {
                var that = this,
                    items = that._getOrderedItems(params.validators, $.map(params.brokenRules, function(rule) {
                        return {
                                text: rule.message,
                                validator: rule.validator
                            }
                    }));
                that.validators = params.validators;
                $.each(that.validators, function(_, validator) {
                    var handler = $.proxy(that._itemValidationHandler, that),
                        disposingHandler = function() {
                            validator.off("validated", handler);
                            handler = null
                        };
                    validator.on("validated", handler);
                    validator.on("disposing", disposingHandler)
                });
                that.option("items", items)
            },
            _itemValidationHandler: function(itemValidationResult) {
                var items = this.option("items"),
                    isValid = itemValidationResult.isValid,
                    elementIndex,
                    replacementFound = false,
                    newMessage = itemValidationResult.brokenRule && itemValidationResult.brokenRule.message,
                    validator = itemValidationResult.validator;
                if (isValid) {
                    $.each(items, function(index, item) {
                        if (item.validator === validator) {
                            elementIndex = index;
                            replacementFound = true;
                            return false
                        }
                    });
                    if (replacementFound)
                        items.splice(elementIndex, 1)
                }
                else {
                    $.each(items, function(index, item) {
                        if (item.validator === validator) {
                            item.text = newMessage;
                            replacementFound = true;
                            return false
                        }
                    });
                    if (!replacementFound)
                        items.push({
                            text: newMessage,
                            validator: validator
                        })
                }
                items = this._getOrderedItems(this.validators, items);
                this.option("items", items)
            },
            _render: function() {
                this.element().addClass(VALIDATION_SUMMARY_CLASS);
                this.callBase()
            },
            _optionChanged: function(args) {
                switch (args.name) {
                    case"validationGroup":
                        this._initGroupRegistration();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _itemClass: function() {
                return ITEM_CLASS
            },
            _itemDataKey: function() {
                return ITEM_DATA_KEY
            },
            _postprocessRenderItem: function(params) {
                params.itemElement.on("click", function() {
                    params.itemData.validator.focus()
                })
            },
            _dispose: function() {
                this.callBase();
                this._unsubscribeGroup()
            }
        }))
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.fileUploader.js */
    (function($, DX, undefined) {
        var ui = DX.ui,
            utils = DX.utils;
        var FILEUPLOADER_CLASS = "dx-fileuploader",
            FILEUPLOADER_EMPTY_CLASS = "dx-fileuploader-empty",
            FILEUPLOADER_DRAGOVER = "dx-fileuploader-dragover",
            FILEUPLOADER_FILEINPUT_TAG = "<input type='file'>",
            FILEUPLOADER_WRAPPER_CLASS = "dx-fileuploader-wrapper",
            FILEUPLOADER_CONTAINER_CLASS = "dx-fileuploader-container",
            FILEUPLOADER_CONTENT_CLASS = "dx-fileuploader-content",
            FILEUPLOADER_INPUT_WRAPPER_CLASS = "dx-fileuploader-input-wrapper",
            FILEUPLOADER_INPUT_CONTAINER_CLASS = "dx-fileuploader-input-container",
            FILEUPLOADER_INPUT_LABEL_CLASS = "dx-fileuploader-input-label",
            FILEUPLOADER_INPUT_CLASS = "dx-fileuploader-input",
            FILEUPLOADER_FILES_CONTAINER_CLASS = "dx-fileuploader-files-container",
            FILEUPLOADER_FILE_CONTAINER_CLASS = "dx-fileuploader-file-container",
            FILEUPLOADER_FILE_INFO_CLASS = "dx-fileuploader-file-info",
            FILEUPLOADER_FILE_STATUS_CLASS = "dx-fileuploader-file-status",
            FILEUPLOADER_FILE_STATUS_MESSAGE_CLASS = "dx-fileuploader-file-status-message",
            FILEUPLOADER_FILE_CLASS = "dx-fileuploader-file",
            FILEUPLOADER_FILE_NAME_CLASS = "dx-fileuploader-file-name",
            FILEUPLOADER_FILE_SIZE_CLASS = "dx-fileuploader-file-size",
            FILEUPLOADER_BUTTON_CLASS = "dx-fileuploader-button",
            FILEUPLOADER_BUTTON_CONTAINER_CLASS = "dx-fileuploader-button-container",
            FILEUPLOADER_CANCEL_BUTTON_CLASS = "dx-fileuploader-cancel-button",
            FILEUPLOADER_UPLOAD_BUTTON_CLASS = "dx-fileuploader-upload-button",
            FILEUPLOADER_AFTER_LOAD_DELAY = 400;
        var isFormDataSupported = function() {
                return !!window.FormData
            },
            getFormDataPrototype = function() {
                return FormData
            },
            getRequestPrototype = function() {
                return XMLHttpRequest
            };
        DX.registerComponent("dxFileUploader", ui, ui.Editor.inherit({
            _supportedKeys: function() {
                var click = function(e) {
                        e.preventDefault();
                        if (this._$button)
                            this._$button.click()
                    };
                return $.extend(this.callBase(), {
                        space: click,
                        enter: click
                    })
            },
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {buttonText: {
                        since: "15.1",
                        alias: "selectButtonText"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    value: null,
                    values: [],
                    selectButtonText: Globalize.localize("dxFileUploader-selectFile"),
                    uploadButtonText: Globalize.localize("dxFileUploader-upload"),
                    labelText: Globalize.localize("dxFileUploader-dropFile"),
                    name: "files[]",
                    multiple: false,
                    accept: "",
                    uploadUrl: "/",
                    allowCanceling: true,
                    showFileList: true,
                    progress: 0,
                    deleteUrl: "",
                    readyToUploadMessage: Globalize.localize("dxFileUploader-readyToUpload"),
                    uploadedMessage: Globalize.localize("dxFileUploader-uploaded"),
                    uploadFailedMessage: Globalize.localize("dxFileUploader-uploadFailedMessage"),
                    uploadMode: "instantly"
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }])
            },
            _init: function() {
                this.option("value", null);
                this.option("values", []);
                this.callBase.apply(this, arguments);
                this._initFileInput();
                this._initLabel();
                this._initDragEvents();
                this._createFiles();
                this.element().addClass(FILEUPLOADER_CLASS)
            },
            _initFileInput: function() {
                if (!this._$fileInput) {
                    this._$fileInput = $(FILEUPLOADER_FILEINPUT_TAG);
                    this._$fileInput.on("change", $.proxy(this._inputChangeHandler, this));
                    this._$fileInput.on("click", $.proxy(function(e) {
                        var isCustomEvent = this._isCustomEvent || false;
                        this._isCustomEvent = false;
                        return isCustomEvent
                    }, this))
                }
                this._$fileInput.prop({
                    multiple: this.option("multiple"),
                    name: this.option("name"),
                    accept: this.option("accept")
                })
            },
            _inputChangeHandler: function(e) {
                if (this._doPreventInputChange)
                    return;
                var fileName = this._$fileInput.val().replace(/^.*\\/, ''),
                    files = this._$fileInput.prop("files"),
                    values = [];
                if (files)
                    $.each(files, function(_, value) {
                        values.push(value)
                    });
                else
                    values = [{name: fileName}];
                this._shouldChangeValue = true;
                this.option("values", values);
                delete this._shouldChangeValue;
                if (this.option("uploadMode") === "instantly")
                    this._uploadFiles()
            },
            _initLabel: function() {
                if (!this._$inputLabel)
                    this._$inputLabel = $("<div>");
                this._$inputLabel.text(this.option("labelText"))
            },
            _initDragEvents: function() {
                if (DX.devices.real().platform !== "generic" || DX.browser.msie)
                    return;
                this._dragEventsCount = 0;
                this.element().on("dragenter", $.proxy(this._dragEnterHandler, this)).on("dragleave", $.proxy(this._dragLeaveHandler, this)).on("drop", $.proxy(this._dropHandler, this))
            },
            _dragEnterHandler: function() {
                if (this.option("disabled"))
                    return false;
                this._dragEventsCount++;
                this.element().addClass(FILEUPLOADER_DRAGOVER)
            },
            _dragLeaveHandler: function() {
                this._dragEventsCount--;
                if (this._dragEventsCount <= 0)
                    this.element().removeClass(FILEUPLOADER_DRAGOVER)
            },
            _dropHandler: function() {
                this._dragEventsCount = 0;
                this.element().removeClass(FILEUPLOADER_DRAGOVER)
            },
            _focusTarget: function() {
                return this.element().find("." + FILEUPLOADER_BUTTON_CLASS)
            },
            _render: function() {
                this._renderWrapper();
                this._renderInputWrapper();
                this._renderSelectButton();
                this._renderInputContainer();
                this._renderFiles();
                this._renderUploadButton();
                this.callBase.apply(this, arguments)
            },
            _createFiles: function() {
                this._files = [];
                $.each(this.option("values"), $.proxy(function(_, value) {
                    this._files.push(this._createFile(value))
                }, this))
            },
            _createFile: function(value) {
                return {
                        value: value,
                        loadedSize: 0,
                        onProgress: $.Callbacks(),
                        onLoad: $.Callbacks(),
                        onError: $.Callbacks(),
                        onLoadStart: $.Callbacks()
                    }
            },
            _renderFiles: function() {
                if (!this._$filesContainer)
                    this._$filesContainer = $("<div>").addClass(FILEUPLOADER_FILES_CONTAINER_CLASS).appendTo(this._$content);
                else
                    this._$filesContainer.empty();
                if (this.option("showFileList")) {
                    var that = this;
                    $.each(this._files, function(_, file) {
                        that._renderFile(file)
                    })
                }
                this.element().toggleClass(FILEUPLOADER_EMPTY_CLASS, !this._files.length);
                this._updateFileNameMaxWidth()
            },
            _renderFile: function(file) {
                var that = this,
                    value = file.value;
                var $fileContainer = $("<div>").addClass(FILEUPLOADER_FILE_CONTAINER_CLASS).appendTo(this._$filesContainer);
                this._renderFileButtons(file, $fileContainer);
                file.$file = $("<div>").addClass(FILEUPLOADER_FILE_CLASS).appendTo($fileContainer);
                var $fileInfo = $("<div>").addClass(FILEUPLOADER_FILE_INFO_CLASS).appendTo(file.$file);
                file.$statusMessage = $("<div>").addClass(FILEUPLOADER_FILE_STATUS_MESSAGE_CLASS).text(this.option("readyToUploadMessage")).appendTo(file.$file);
                $("<div>").addClass(FILEUPLOADER_FILE_NAME_CLASS).text(value.name).appendTo($fileInfo);
                if (utils.isDefined(value.size))
                    $("<div>").addClass(FILEUPLOADER_FILE_SIZE_CLASS).text(this._getFileSize(value.size)).appendTo($fileInfo)
            },
            _updateFileNameMaxWidth: function() {
                var cancelButtonsCount = this.option("allowCanceling") ? 1 : 0,
                    uploadButtonsCount = this.option("uploadMode") === "useButtons" ? 1 : 0,
                    filesContainerWidth = this._$filesContainer.width(),
                    $buttonContainer = this._$filesContainer.find("." + FILEUPLOADER_BUTTON_CONTAINER_CLASS).eq(0),
                    buttonsWidth = $buttonContainer.width() * (cancelButtonsCount + uploadButtonsCount),
                    $fileSize = this._$filesContainer.find("." + FILEUPLOADER_FILE_SIZE_CLASS).eq(0);
                var prevFileSize = $fileSize.text();
                $fileSize.text("1000Mb");
                var fileSizeWidth = $fileSize.width();
                $fileSize.text(prevFileSize);
                this._$filesContainer.find("." + FILEUPLOADER_FILE_NAME_CLASS).css("max-width", filesContainerWidth - buttonsWidth - fileSizeWidth)
            },
            _renderFileButtons: function(file, $container) {
                file.cancelButton = this._createComponent($("<div>").addClass(FILEUPLOADER_BUTTON_CLASS + " " + FILEUPLOADER_CANCEL_BUTTON_CLASS), "dxButton", {
                    onClick: $.proxy(function() {
                        this._removeFile(file)
                    }, this),
                    icon: "close",
                    visible: this.option("allowCanceling")
                });
                $("<div>").addClass(FILEUPLOADER_BUTTON_CONTAINER_CLASS).append(file.cancelButton.element()).appendTo($container);
                if (this.option("uploadMode") === "useButtons") {
                    file.uploadButton = this._createComponent($("<div>").addClass(FILEUPLOADER_BUTTON_CLASS + " " + FILEUPLOADER_UPLOAD_BUTTON_CLASS), "dxButton", {
                        onClick: $.proxy(function(e) {
                            this._uploadFile(file)
                        }, this),
                        icon: "upload"
                    });
                    $("<div>").addClass(FILEUPLOADER_BUTTON_CONTAINER_CLASS).append(file.uploadButton.element()).appendTo($container);
                    file.onLoadStart.add($.proxy(function() {
                        file.uploadButton.element().remove()
                    }, this))
                }
            },
            _removeFile: function(file) {
                file.$file.parent().remove();
                var values = this.option("values");
                values.splice($.inArray(file.value, values), 1);
                this._files.splice($.inArray(file, this._files), 1);
                this.element().toggleClass(FILEUPLOADER_EMPTY_CLASS, !this._files.length);
                this._recalculateProgress();
                this._doPreventInputChange = true;
                this._$fileInput.val("");
                this._doPreventInputChange = false
            },
            _getFileSize: function(size) {
                var i = 0,
                    labels = [Globalize.localize("dxFileUploader-bytes"), Globalize.localize("dxFileUploader-kb"), Globalize.localize("dxFileUploader-Mb"), Globalize.localize("dxFileUploader-Gb")],
                    count = labels.length - 1;
                while (i < count && size >= 1024) {
                    size /= 1024;
                    i++
                }
                return Math.round(size) + labels[i]
            },
            _renderSelectButton: function() {
                var $button = $("<div>").addClass(FILEUPLOADER_BUTTON_CLASS).appendTo(this._$inputWrapper);
                $button.off("click").on("click", $.proxy(this._selectButtonClickHandler, this));
                this._selectButton = this._createComponent($button, "dxButton", {
                    text: this.option("selectButtonText"),
                    focusStateEnabled: false
                })
            },
            _selectButtonClickHandler: function() {
                if (this.option("disabled"))
                    return false;
                this._isCustomEvent = true;
                this._$fileInput.click()
            },
            _renderUploadButton: function() {
                if (this.option("uploadMode") !== "useButtons")
                    return;
                var $uploadButton = $("<div>").addClass(FILEUPLOADER_BUTTON_CLASS).addClass(FILEUPLOADER_UPLOAD_BUTTON_CLASS).appendTo(this._$content);
                this._uploadButton = this._createComponent($uploadButton, "dxButton", {
                    text: this.option("uploadButtonText"),
                    onClick: $.proxy(this._uploadButtonClickHandler, this)
                })
            },
            _uploadButtonClickHandler: function() {
                this._uploadFiles()
            },
            _renderInputContainer: function() {
                this._$inputContainer = $("<div>").addClass(FILEUPLOADER_INPUT_CONTAINER_CLASS).appendTo(this._$inputWrapper);
                if (DX.browser.msie)
                    this._$inputContainer.css("display", "none");
                this._$fileInput.addClass(FILEUPLOADER_INPUT_CLASS).appendTo(this._$inputContainer);
                this._$inputLabel.addClass(FILEUPLOADER_INPUT_LABEL_CLASS).appendTo(this._$inputContainer)
            },
            _renderInputWrapper: function() {
                this._$inputWrapper = $("<div>").addClass(FILEUPLOADER_INPUT_WRAPPER_CLASS).appendTo(this._$content)
            },
            _renderWrapper: function() {
                var $wrapper = $("<div>").addClass(FILEUPLOADER_WRAPPER_CLASS).appendTo(this.element());
                var $container = $("<div>").addClass(FILEUPLOADER_CONTAINER_CLASS).appendTo($wrapper);
                this._$content = $("<div>").addClass(FILEUPLOADER_CONTENT_CLASS).appendTo($container)
            },
            _clean: function() {
                this._$fileInput.detach();
                delete this._$filesContainer;
                this.callBase.apply(this, arguments)
            },
            _uploadFiles: function() {
                if (!isFormDataSupported())
                    return;
                var files = this.option("values");
                $.each(this._files, $.proxy(function(_, file) {
                    this._uploadFile(file)
                }, this))
            },
            _uploadFile: function(file) {
                if (file.progressBar)
                    return;
                var $file = file.$file;
                var value = file.value;
                this._initUploadRequest(file);
                if ($file) {
                    file.progressBar = this._createProgressBar(value.size);
                    file.progressBar.element().appendTo($file);
                    this._initStatusMessage(file);
                    this._initCancelButton(file)
                }
                file.onError.add($.proxy(this._onErrorHandler, this, file));
                file.onProgress.add($.proxy(this._onProgressHandler, this, file));
                file.request.send(this._createFormData(this.option("name"), value))
            },
            _onErrorHandler: function(file) {
                file.progressBar.element().remove();
                file.$statusMessage.text(this.option("uploadFailedMessage"));
                file.$statusMessage.css("display", "")
            },
            _onProgressHandler: function(file, e) {
                var totalSize = this._getTotalSize(),
                    currentLoadedSize = 0,
                    loadedSize = this._getLoadedSize(),
                    progress = 0;
                if (file) {
                    currentLoadedSize = Math.min(e.loaded, file.value.size);
                    loadedSize += currentLoadedSize - file.loadedSize;
                    file.progressBar && file.progressBar.option({
                        value: currentLoadedSize,
                        showStatus: true
                    });
                    file.loadedSize = currentLoadedSize
                }
                if (totalSize)
                    progress = Math.round(loadedSize / totalSize * 100);
                this.option("progress", progress);
                this._setLoadedSize(loadedSize)
            },
            _initStatusMessage: function(file) {
                var that = this;
                file.$statusMessage.css("display", "none");
                file.onLoad.add(function() {
                    setTimeout(function() {
                        file.$statusMessage.text(that.option("uploadedMessage"));
                        file.$statusMessage.css("display", "");
                        file.progressBar.element().remove()
                    }, FILEUPLOADER_AFTER_LOAD_DELAY)
                })
            },
            _initCancelButton: function(file) {
                var that = this;
                var cancelClickHandler = $.proxy(function() {
                        file.request.abort();
                        this._removeFile(file)
                    }, this);
                file.cancelButton.option("onClick", cancelClickHandler);
                var deleteClickHandler = function() {
                        var request = this._createRequest(this.option("deleteUrl")),
                            formData = this._createFormData(this.option("name"), file.value.name);
                        request.send(formData);
                        this._removeFile(file)
                    };
                file.onLoad.add(function() {
                    setTimeout(function() {
                        file.cancelButton.option({
                            visible: !!that.option("deleteUrl"),
                            onClick: $.proxy(deleteClickHandler, that)
                        })
                    }, FILEUPLOADER_AFTER_LOAD_DELAY)
                })
            },
            _initUploadRequest: function(file) {
                file.request = this._createRequest(this.option("uploadUrl"));
                file.loadedSize = 0;
                file.request.upload.onload = $.proxy(function(e) {
                    this.onLoad.fire(e)
                }, file);
                file.request.upload.onprogress = $.proxy(function(e) {
                    this.onProgress.fire(e)
                }, file);
                file.request.upload.onerror = $.proxy(function(e) {
                    this.onError.fire(e)
                }, file);
                file.request.upload.onloadstart = $.proxy(function(e) {
                    this.onLoadStart.fire(e)
                }, file)
            },
            _createRequest: function(url) {
                var Request = getRequestPrototype(),
                    request = new Request;
                request.open("POST", url, true);
                return request
            },
            _createFormData: function(fieldName, fieldValue) {
                var FormData = getFormDataPrototype(),
                    formData = new FormData;
                formData.append(fieldName, fieldValue);
                return formData
            },
            _createProgressBar: function(fileSize) {
                return this._createComponent($("<div>"), "dxProgressBar", {
                        value: undefined,
                        min: 0,
                        max: fileSize,
                        statusFormat: function(ratio) {
                            return Math.round(ratio * 100) + "%"
                        },
                        showStatus: false,
                        statusPosition: "right"
                    })
            },
            _getTotalSize: function() {
                if (!this._totalSize) {
                    var files = this.option("values"),
                        totalSize = 0;
                    $.each(files, function(_, file) {
                        totalSize += file.size
                    });
                    this._totalSize = totalSize
                }
                return this._totalSize
            },
            _getLoadedSize: function() {
                if (!this._loadedSize) {
                    var loadedSize = 0;
                    $.each(this._files, function(_, file) {
                        loadedSize += file.loadedSize
                    });
                    this._loadedSize = loadedSize
                }
                return this._loadedSize
            },
            _setLoadedSize: function(value) {
                this._loadedSize = value
            },
            _recalculateProgress: function() {
                delete this._totalSize;
                delete this._loadedSize;
                this._onProgressHandler()
            },
            _optionChanged: function(args) {
                var value = args.value;
                switch (args.name) {
                    case"height":
                    case"width":
                        this._updateFileNameMaxWidth();
                        this.callBase(args);
                        break;
                    case"value":
                        if (!this._shouldChangeValue) {
                            this._$fileInput.val("");
                            this.option("values", [])
                        }
                        this.callBase(args);
                        break;
                    case"values":
                        if (value.length && !this._shouldChangeValue)
                            this.option("values", []);
                        else {
                            this._createFiles();
                            this._renderFiles();
                            this.option("value", value[0] || null);
                            this._recalculateProgress()
                        }
                        break;
                    case"name":
                    case"accept":
                        this._initFileInput();
                        break;
                    case"multiple":
                        this._initFileInput();
                        if (!args.value)
                            this.option("values", []);
                        break;
                    case"selectButtonText":
                        this._selectButton.option("text", value);
                        break;
                    case"uploadButtonText":
                        this._uploadButton && this._uploadButton.option("text", value);
                        break;
                    case"readyToUploadMessage":
                    case"uploadedMessage":
                    case"uploadFailedMessage":
                        this._invalidate();
                        break;
                    case"labelText":
                        this._$inputLabel.text(value);
                        break;
                    case"showFileList":
                        this._renderFiles();
                        break;
                    case"uploadUrl":
                    case"deleteUrl":
                    case"progress":
                        break;
                    case"allowCanceling":
                    case"uploadMode":
                        this.reset();
                        this._invalidate();
                        break;
                    default:
                        this.callBase(args)
                }
            },
            _valueChangeArgs: function() {
                return $.extend(this.callBase.apply(this, arguments), {values: this.option("values")})
            }
        }));
        ui.dxFileUploader.__internals = {
            FILEUPLOADER_CLASS: FILEUPLOADER_CLASS,
            FILEUPLOADER_EMPTY_CLASS: FILEUPLOADER_EMPTY_CLASS,
            FILEUPLOADER_DRAGOVER: FILEUPLOADER_DRAGOVER,
            FILEUPLOADER_WRAPPER_CLASS: FILEUPLOADER_WRAPPER_CLASS,
            FILEUPLOADER_CONTAINER_CLASS: FILEUPLOADER_CONTAINER_CLASS,
            FILEUPLOADER_CONTENT_CLASS: FILEUPLOADER_CONTENT_CLASS,
            FILEUPLOADER_INPUT_WRAPPER_CLASS: FILEUPLOADER_INPUT_WRAPPER_CLASS,
            FILEUPLOADER_INPUT_CONTAINER_CLASS: FILEUPLOADER_INPUT_CONTAINER_CLASS,
            FILEUPLOADER_INPUT_LABEL_CLASS: FILEUPLOADER_INPUT_LABEL_CLASS,
            FILEUPLOADER_INPUT_CLASS: FILEUPLOADER_INPUT_CLASS,
            FILEUPLOADER_FILES_CONTAINER_CLASS: FILEUPLOADER_FILES_CONTAINER_CLASS,
            FILEUPLOADER_FILE_CONTAINER_CLASS: FILEUPLOADER_FILE_CONTAINER_CLASS,
            FILEUPLOADER_FILE_CLASS: FILEUPLOADER_FILE_CLASS,
            FILEUPLOADER_FILE_NAME_CLASS: FILEUPLOADER_FILE_NAME_CLASS,
            FILEUPLOADER_FILE_SIZE_CLASS: FILEUPLOADER_FILE_SIZE_CLASS,
            FILEUPLOADER_BUTTON_CLASS: FILEUPLOADER_BUTTON_CLASS,
            FILEUPLOADER_CANCEL_BUTTON_CLASS: FILEUPLOADER_CANCEL_BUTTON_CLASS,
            FILEUPLOADER_UPLOAD_BUTTON_CLASS: FILEUPLOADER_UPLOAD_BUTTON_CLASS,
            FILEUPLOADER_FILE_INFO_CLASS: FILEUPLOADER_FILE_INFO_CLASS,
            FILEUPLOADER_FILE_STATUS_CLASS: FILEUPLOADER_FILE_STATUS_CLASS,
            FILEUPLOADER_FILE_STATUS_MESSAGE_CLASS: FILEUPLOADER_FILE_STATUS_MESSAGE_CLASS,
            getFormDataPrototype: getFormDataPrototype,
            getRequestPrototype: getRequestPrototype,
            isFormDataSupported: isFormDataSupported,
            changeFileInputTag: function(tag) {
                FILEUPLOADER_FILEINPUT_TAG = tag
            },
            resetFileInputTag: function() {
                FILEUPLOADER_FILEINPUT_TAG = "<input type='file'>"
            },
            changeRequestClass: function(requestClass) {
                getRequestPrototype = function() {
                    return requestClass
                }
            },
            resetRequestClass: function() {
                getRequestPrototype = this.getRequestPrototype
            },
            changeFormDataClass: function(customFormData) {
                getFormDataPrototype = function() {
                    return customFormData
                }
            },
            resetFormDataClass: function() {
                getFormDataPrototype = this.getFormDataPrototype
            }
        }
    })(jQuery, DevExpress);
    /*! Module widgets-base, file ui.tabPanel.js */
    (function($, DX, undefined) {
        var ui = DX.ui;
        var TABPANEL_CLASS = "dx-tabpanel";
        DX.registerComponent("dxTabPanel", ui, ui.dxMultiView.inherit({
            _setDeprecatedOptions: function() {
                this.callBase();
                $.extend(this._deprecatedOptions, {titleTemplate: {
                        since: "14.2",
                        alias: "itemTitleTemplate"
                    }})
            },
            _setDefaultOptions: function() {
                this.callBase();
                this.option({
                    itemTitleTemplate: "title",
                    onTitleClick: null,
                    onTitleHold: null,
                    onTitleRendered: null
                })
            },
            _defaultOptionsRules: function() {
                return this.callBase().concat([{
                            device: function(device) {
                                return DX.devices.real().generic && !DX.devices.isSimulator()
                            },
                            options: {focusStateEnabled: true}
                        }, {
                            device: function(device) {
                                return !DX.support.touch
                            },
                            options: {swipeEnabled: false}
                        }, {
                            device: {platform: "generic"},
                            options: {animationEnabled: false}
                        }])
            },
            _init: function() {
                this.callBase();
                this.element().addClass(TABPANEL_CLASS);
                this.setAria("role", "tabpanel");
                this._renderBox()
            },
            _renderBox: function() {
                var $box = $("<div>").appendTo(this.element());
                this._box = this._createComponent($box, "dxBox", {
                    direction: "col",
                    align: "flex-start",
                    crossAlign: "stretch",
                    items: [{
                            ratio: 0,
                            shrink: 0,
                            baseSize: "auto",
                            template: $.proxy(function() {
                                var $tabs = $("<div>");
                                this._tabs = this._createComponent($tabs, "dxTabs", this._tabConfig());
                                return $tabs
                            }, this)
                        }, {
                            ratio: 1,
                            shrink: 1,
                            baseSize: "auto",
                            template: $.proxy(function(_, __, $content) {
                                this._$wrapper.addClass($content.attr("class"));
                                $content.replaceWith(this._$wrapper)
                            }, this)
                        }],
                    height: "100%"
                })
            },
            _refreshActiveDescendant: function() {
                var tabs = this._tabs,
                    tabItems = tabs.itemElements(),
                    $activeTab = $(tabItems[tabs.option("selectedIndex")]),
                    id = this.getFocusedItemId();
                this.setAria("controls", undefined, $(tabItems));
                this.setAria("controls", id, $activeTab)
            },
            _tabConfig: function() {
                return {
                        selectOnFocus: true,
                        focusStateEnabled: this.option("focusStateEnabled"),
                        tabIndex: this.option("tabIndex"),
                        selectedIndex: this.option("selectedIndex"),
                        onItemClick: this.option("onTitleClick"),
                        onItemHold: this.option("onTitleHold"),
                        itemHoldTimeout: this.option("itemHoldTimeout"),
                        onSelectionChanged: $.proxy(function(e) {
                            this.option("selectedIndex", e.component.option("selectedIndex"));
                            this._refreshActiveDescendant()
                        }, this),
                        onItemRendered: this.option("onTitleRendered"),
                        itemTemplate: this._getTemplateByOption("itemTitleTemplate"),
                        items: this.option("items"),
                        scrollingEnabled: false,
                        itemTemplateProperty: "tabTemplate",
                        selectionRequired: true,
                        onOptionChanged: $.proxy(function(args) {
                            var name = args.name,
                                value = args.value;
                            if (name === "focusedElement") {
                                var id = value ? value.index() : value;
                                var newItem = value ? this._itemElements().eq(id) : value;
                                this.option("focusedElement", newItem)
                            }
                        }, this),
                        onFocusIn: $.proxy(this._focusInHandler, this),
                        onFocusOut: $.proxy(this._focusOutHandler, this)
                    }
            },
            _renderFocusTarget: function() {
                this._focusTarget().attr("tabindex", -1);
                this._refreshActiveDescendant()
            },
            _setTabsOption: function(name, value) {
                if (this._tabs)
                    this._tabs.option(name, value)
            },
            _updateSelection: function() {
                this.callBase.apply(this, arguments);
                this._box.repaint()
            },
            _optionChanged: function(args) {
                var name = args.name,
                    value = args.value;
                switch (name) {
                    case"dataSource":
                        this.callBase(args);
                        break;
                    case"items":
                    case"selectedIndex":
                    case"selectedItem":
                    case"itemHoldTimeout":
                    case"focusStateEnabled":
                        this._setTabsOption(name, value);
                        this.callBase(args);
                        break;
                    case"focusedElement":
                        var id = value ? value.index() : value;
                        var newItem = value ? this._tabs._itemElements().eq(id) : value;
                        this._setTabsOption("focusedElement", newItem);
                        this.callBase(args);
                        this._tabs.focus();
                        break;
                    case"itemTitleTemplate":
                        this._setTabsOption("itemTemplate", this._getTemplateByOption("itemTitleTemplate"));
                        break;
                    case"onTitleClick":
                        this._setTabsOption("onItemClick", value);
                        break;
                    case"onTitleHold":
                        this._setTabsOption("onItemHold", value);
                        break;
                    case"onTitleRendered":
                        this._setTabsOption("onItemRendered", value);
                        break;
                    default:
                        this.callBase(args)
                }
            }
        }))
    })(jQuery, DevExpress);
    DevExpress.MOD_WIDGETS_BASE = true
}