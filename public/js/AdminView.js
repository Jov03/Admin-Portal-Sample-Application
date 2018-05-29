
var companyData=[];
$(document).ready(function () {


    $.ajax({
        type: "GET",
        url: "/Company",
        data: "{}",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        cache: false,
        success: function (data) {
            console.log(data);
            companyData=data;
            $("#CompanyTable").append(buildTable(data));

        }
    });
});

function edit(value) {
    var url = "/Company/" + value + "/edit";
    location.replace(url);
};
function deleteCompany(value){
    var userConfirm=confirm("This Company Will Be Deleted");
    if(userConfirm){
        $.ajax({
            url:'/Company/'+value,
            type:'delete',
            success:function(){
                location.reload();
            }
        });
    }
}
function approveCompany(value){
    $.ajax({
        url:'/Company/'+value+"/approve",
        type:"PUT",
        success:function(){
            location.reload();
        }
    });
}
function filter(value){
    if(value==1){
        companyData.sort(function(a,b){
            if(a.CompanyName<b.CompanyName){
                return -1;
            }
            if(a.CompanyName>b.CompanyName){
                return 1;
            }
            return 0;
        });
    }else{
        companyData.sort(function(a,b){
            if(a.CreatedBy<b.CreatedBy){
                return -1;
            }
            if(a.CreatedBy>b.CreatedBy){
                return 1;
            }
            return 0;
        });

    }
    $("#CompanyTable").append(buildTable(companyData));

}

function buildTable(data) {
    $("#CompanyTable").children().remove();
    var tableHtml = "";
    var approveButton="";
    for (let company of data) {
        if(!company.Approved){
            approveButton="<button class='btn btn-warning' onClick='approveCompany(value)' value=" + company._id + ">Approve</button>";
        }else{
            approveButton="";
        }
        tableHtml += "<tr>\
        <td>" + company.CompanyName + "</td>\
        <td>" + company.CreatedBy + "</td>\
        <td>" + company.Address + "</td>\
        <td>\
        <button class='btn btn-secondary' onClick='edit(value)' value=" + company._id + ">Edit</button>\
        <button class='btn btn-danger' onClick='deleteCompany(value)' value=" + company._id + ">Delete</button>\
        "+approveButton+"</td></tr>";
    }
    return tableHtml;

}