var Editors = {

    saved: false,

    init: function(options){
        var editor_suffix = "_mobile";
        this.options = $.extend( {}, this.options, options );
        if (Metro.utils.isValue(options) && Metro.utils.isValue(options.editor)) {
            this.editor_options = $.extend( {}, this.editor_options, options.editor );
        }
        this.html_editor = null;
        this.css_editor = null;
        this.js_editor = null;
        this.edit_timer = null;
        this.edit_timer_threshold = 2000;

        if (Metro.utils.mediaExist("lg")) {editor_suffix = "";}

        this.createEditor('html_editor', "html_editor"+editor_suffix, {
            mode: 'text/html'
        });
        this.createEditor('css_editor', "css_editor"+editor_suffix, {
            mode: 'text/x-less'
        });
        this.createEditor('js_editor', "js_editor"+editor_suffix, {
            mode: 'javascript'
        });
    },

    options: {
        editTimerCallback: Metro.noop
    },

    editor_options: {
        lineNumbers: true,
        lineWrapping: false,
        theme: 'idea',
        matchTags: {bothTags: true},
        extraKeys: {
            "Ctrl-Q": function(cm){cm.foldCode(cm.getCursor());},
            "Ctrl-Space": "autocomplete",
            "Ctrl-J": "toMatchingTag",
            "F11": function(cm){cm.setOption("fullScreen", !cm.getOption("fullScreen"));}
        },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        continueComments: "Enter",
        autoCloseTags: true,
        autoCloseBrackets: true,
        styleActiveLine: true
    },

    createEditor: function(editor, editor_el, options){
        var that = this, o = this.options;
        var editor_options = $.extend( {}, this.editor_options, options );
        this[editor] = CodeMirror.fromTextArea(document.getElementById(editor_el), editor_options);
        this[editor].setSize("100%", "100%");
        this[editor].on("beforeChange", function(instance, changeObj){
            Editors.saved = false;
        });
        this[editor].on("change", function(instance, changeObj){
            clearTimeout(that.edit_timer);
            that.edit_timer = setTimeout(function () {
                clearTimeout(that.edit_timer);
                Metro.utils.exec(o.editTimerCallback, null, that[editor]);
            }, that.edit_timer_threshold);
        });

    },

    getEditorValue: function(editor){
        return this[editor].getValue();
    },

    refreshAll: function(){
        var that = this;

        $.each(['html_editor', 'css_editor', 'js_editor'], function(){
            that[this].refresh();
        })
    }

};

Editors.init({
    editTimerCallback: Sandbox.editTimer
});

window.onbeforeunload = function(e){
    if (Editors.saved === false) {
        $.post("/code/unsaved");
    }
};