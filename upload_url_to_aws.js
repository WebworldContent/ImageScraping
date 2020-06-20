


Promise.all(result.link.map((element, indx) => {
    console.log("elelecmemt", element, indx)
    return put_from_url(element,lable)  // label is folder name inside bucket

}))



    .then((res) => {

        return Promise.all(
            res.map((data, indx) => {
                return fileS3Upload(data, indx)
            }))

    })
    .then(function (result) {
        console.log('uploaded to bucket AWS: ',result)
    })

function put_from_url(link, lable) {

    return new Promise((resolve, reject) => {

        // console.log('link_______', link)

        request({
            url: link,
            encoding: null
        }, function (err, res, body) {
            if (err)
                reject(err);

            else {
                // let collection = []
                let obj = {}
                // obj['link'] = link
                obj['body'] = body
                obj['ContentType'] = res.headers['content-type']
                obj['lable'] = lable
                obj['username'] = username

                // collection.push(obj)

                resolve(obj)
            }
        })

    })

}







function fileS3Upload(result, indx) {
    return new Promise((resolve, reject) => {


        // console.log('>>>>>>>', result)

        let extention = result.ContentType.split('/')

        var fileName = Date.now() + '___' + 'image' + '.' + extention[1];

        // result['fileName'] = fileName

        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `bucket_naame/lablesObject/` + `${lable}` + '/' + fileName,
            ContentType: result.ContentType,
            Body: result.body
        };
        S3.putObject(params, function (err, data) {
            if (err) {
                console.log(err)
                reject(err);
            }
            else {
                console.log('File uploaded successfully.Tag:', data);


                result['url'] = "https://" + params.Bucket + ".s3.eu-central-1.amazonaws.com" + "/" + params.Key;

                let sp = params.Key.split('/')
                result['fileName'] = sp[sp.length - 1]
                delete result.body
                delete result.ContentType
                resolve(result);
            }
        });

    })
}
