module.exports = {
    "author": "单炒饭",
    "mail": "sbfkcel@163.com",
    "projectName": "dcore",
    "template": "default",
    "createTime": 1533698544601,
    "distReplace": {
        "*": [
            {
                "find": "feutil.localstatic.com",
                "replace": "pic.my4399.com/re/cms/feUtil"
            },
            {
                "find": "$$localhost/staticfile",
                "replace": "pic.my4399.com/re/cms/feUtil"
            }
        ]
    },
    "srcSync": {
        "targetPath": "",
        "fileType": "*"
    },
    "devSync": {
        "targetPath": "",
        "fileType": "*"
    },
    "distSync": {
        "targetPath": "",
        "fileType": "*"
    }
};