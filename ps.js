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
        let width_p = this._args[1];
        let height_p = this._args[2];
        let fit_num = this._args[3]+'';
        let position_num = this._args[4]+'';
        let fit = 'cover';
        let position = 'centre';

        // console.log('---------------width_p----',width_p);
        // console.log('---------------height_p----',width_p);

        if(width_p<0 || isNaN(width_p)) throw 'Invalid width factor ' + width_p;
        if(height_p<0 || isNaN(height_p)) throw 'Invalid height factor ' + height_p;

        width_p=parseFloat(width_p);
        height_p=parseFloat(height_p);

        let image = sharp(this._src_path);
        let metadata = await image.metadata();
        let width_m = metadata.width;
        let height_m = metadata.height;

        if(width_p<=0 || width_p>width_m) width_p = width_m;
        if(height_p==undefined || height_p<=0 || height_p>height_m) height_p = height_m;
        
        switch(fit_num){
            case '1': fit='cover';break;
            case '2': fit='contain';break;
            case '3': fit='fill';break;
            case '4': fit='inside';break;
            case '5': fit='outside';break;
        }
        switch(position_num){
            case '1': position='top';break;
            case '2': position='right top';break;
            case '3': position='right';break;
            case '4': position='right bottom';break;
            case '5': position='bottom';break;
            case '6': position='left bottom';break;
            case '7': position='left';break;
            case '8': position='left top';break;
        }

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