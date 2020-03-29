/*
 * @Author: your name
 * @Date: 2020-02-12 23:23:25
 * @LastEditTime: 2020-03-29 14:25:28
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
            //只能输入0.1到1直接的数
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
                //设置width
                width  = Math.round(width * parseFloat(scale));
                await image.resize({width:width}).toFile(this._dest_path);
            }
            //return dest;
        }else {
            throw 'Invalid scale factor ' + scale;
        }
    }

    async resize () { 
        let isNum = /^\d+$/;
        let width_p = 0;
        let height_p = 0;
        let fit = 'cover'; // default
        let position_num = '5'; // default
        let position = 'center';
        if (isNum.test(this._args[1])) {
            width_p = parseInt(this._args[1]);
        }else {
            throw 'width must be a int';
        }

        if (isNum.test(this._args[2])) {
            height_p = parseInt(this._args[2]);
        }else {
            throw 'height must be a int';
        }
        
        // args[3] 
        if (this._args[3]) {
            fit = this._args[3];
        }

        if (fit != 'cover' && fit != 'contain' && fit != 'fill' && fit != 'inside' && fit != 'outside') {
            throw 'fit must be one of cover, contain, fill, inside, outside! default cover'
        }

        if (this._args[4]) {
            if (isNum.test(this._args[4])) {
                position_num = this._args[4];
            }else {
                'position number be int';
            }
        }

        switch(position_num){
            case '1': position='left top';break;
            case '2': position='top';break;
            case '3': position='right top';break;
            case '4': position='left';break;
            case '5': position='center';break;
            case '6': position='right';break;
            case '7': position='left bottom';break;
            case '8': position='bottom';break;
            case '9': position='right bottom';break;
            default: throw 'position must be 1 ~ 9, which stand for 1-top left, 2-top, 3-top right, 4-left, 5-center， 6-rigth, 7-left bttom, 8-bottom, 9-right bottom. default center '
        }

        let image = sharp(this._src_path);
        let metadata = await image.metadata();
        let width_m = metadata.width;
        let height_m = metadata.height;
 
        //console.debug('ps.js#resize@width_m,height_m,width_p,height_p,fit,position', width_m, height_m, width_p, height_p, fit, position);

        if(width_p>width_m) width_p = width_m;
        if(height_p>height_m) height_p = height_m;
        
        await image.resize(width_p,height_p,{
            fit: fit,
            position: position
          }).toFile(this._dest_path);
    }

    async exec() {

        let dest = '';
        if (!fs.existsSync(this._src_path)) {
            throw 'src file is not exists !';
        }
        if (this._args[0] == 'slim') {
            dest = await this.slim(this._args[1]);
        }else if (this._args[0] == 'resize') {
            dest = await this.resize()
        }else {
            throw 'unknown param <'+this._args[0]+'>';
        }
        
        return {dest:this._dest_path};
    }
}

module.exports = (src_path, dest_dir, args, ctx) => {
    return new Ps(src_path, dest_dir, args, ctx);
}