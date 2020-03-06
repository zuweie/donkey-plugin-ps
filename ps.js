/*
 * @Author: your name
 * @Date: 2020-02-12 23:23:25
 * @LastEditTime: 2020-03-06 16:16:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /donkey-plugin-slim/slim.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class Ps {
    constructor(src_path, dest_dir, args, ctx) {
        this._src_path = src_path;
        this._dest_dir = dest_dir;
        this._args = args;
        this._ctx = ctx;
        this._dest_path = this._dest_dir+'/'+path.basename(this._src_path);
    }

    async slim() {
        let scale = this._args[1];
        if (scale == 'auto' || ( parseFloat(scale) < 1.0 && parseFloat(scale) >= 0.1)){

            let image = sharp(this._src_path);
            
            let metadata = await image.metadata();
            let width = metadata.width;
            let height = metadata.height;
            //let dest = this._dest_dir+'/'+path.basename(this._src_path);
            if (scale == 'auto' ) {
                let maxSize = 1024 * 1024;
                
                if (width * height > maxSize) {

                    do{

                        width = Math.round(width * 0.8) > 1?Math.round(width * 0.8):1;
                        height = Math.round(height * 0.8) > 1? Math.round(height * 0.8):1;

                    }while((width * height > maxSize) && (width!=1 && height !=1));
                    /** 处理完后把图片输出到 _dest_path */
                    await image.resize({width:width}).toFile(this._dest_path);
                }else{
                    /** 若果原文件已经符合参数需求，则把 _dest_path 设置为 opath，告诉 donkey 原文件已经符合参数需求 */
                    this._dest_path = 'opath';
                }
                
            }else {
                width  = Math.round(width * parseFloat(scale));
                await image.resize({width:width}).toFile(this._dest_path);
            }
            //return dest;
        }else {
            throw 'Invalid scale factor ' + scale;
        }
    }

    async resize () { 
    }

    async exec() {

        let dest = '';
        if (!fs.existsSync(this._src_path)) {
            throw 'src file is not exists !';
        }
        if (this._args[0] == 'slim') {
            dest = await this.slim(this._args[1]);
        }else if (this._args[0] == 'resize') {

        }else {
            throw 'unknown param <'+this._args[0]+'>';
        }
        
        return {dest:this._dest_path};
    }
}

module.exports = (src_path, dest_dir, args, ctx) => {
    return new Ps(src_path, dest_dir, args, ctx);
}